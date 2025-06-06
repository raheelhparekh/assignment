import mongoose, { ObjectId } from "mongoose";
import Book from "../models/book.models.js";
import Review from "../models/review.models.js";
import User from "../models/user.models.js";

// add a book logic
export const addBook = async (req, res) => {
  try {
    const { title, author, description, publishedDate, genre } = req.body;
    const userId = req.user.id;

    if (!title || !author || !publishedDate || !genre) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const existingBook = await Book.findOne({
      title,
      author,
      publishedDate,
      genre,
    });
    if (existingBook) {
      return res.status(400).json({ message: "Book already exists" });
    }

    const book = await Book.create({
      addedBy: userId,
      title,
      author,
      description,
      publishedDate,
      genre,
    });

    // Update user's booksAdded array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { booksAdded: book._id },
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      book: {
        id: book._id,
        addedBy: userId,
        title: book.title,
        description: book.description,
        author: book.author,
        publishedDate: book.publishedDate,
        genre: book.genre,
      },
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ error: "Error adding book" });
  }
};

// get boook by author or genre with pagination
export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, author, genre } = req.query;

    const filter = {};
    if (author) filter.author = new RegExp(author, "i");
    if (genre) filter.genre = new RegExp(genre, "i");

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const books = await Book.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(filter);

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Error fetching books" });
  }
};

// get book by id
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Book ID" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found with this id" });
    }

    res.status(200).json({
      success: true,
      id: book._id,
      title: book.title,
      description: book.description,
      genre: book.genre,
      publishedDate: book.publishedDate,
      averageRatings: book.averageRatings,
      author: book.author,
      createdAt: book.createdAt,
      reviews: book.reviews,
    });
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ error: "Error fetching book by ID" });
  }
};

// add review to book id -> returns review id
export const addReviewToBookId = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid Book ID" });
    }

    // check rating is between 1 and 5
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // find book by id if exists 
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // check if user already reviewed this book. bcoz 1 user can review 1 book only once
    const existingReview = await Review.findOne({
      bookId: new mongoose.Types.ObjectId(bookId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this book" });
    }

    // create review 
    const review = await Review.create({
      bookId,
      userId,
      rating,
      comment: comment || "",
    });

    // update review to book model
    book.reviews.push({
      userId: new mongoose.Types.ObjectId(userId),
      rating,
      comment: comment || "",
    });

    // calculate average rating
    const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
    book.averageRatings = totalRating / book.reviews.length;

    await book.save();

    // update review to user model 
    await User.findByIdAndUpdate(userId, {
      $addToSet: { reviewsAdded: review._id },
    });

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Error adding review" });
  }
};

// update review to book id -> can update only by existing reviewId
export const updateReviewToBookId = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid Review ID" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // const response = await Review.findById(reviewId);
    // if (!response) {
    //   return res.status(404).json({ message: "Review not found" });
    // }

    // Check if review exists and updates only if it belongs to the user
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { rating, comment: comment || "" },
      { new: true }
    );

    // console.log(`review: ${review}`);

    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    // update review in user's reviewsAdded array and average ratings in book
    const book = await Book.findById(review.bookId);
    if (book) {
      const embeddedReview = book.reviews.find((r) => r.userId.equals(userId));
      if (embeddedReview) {
        embeddedReview.rating = rating;
        embeddedReview.comment = comment || "";
        const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
        book.averageRatings = totalRating / book.reviews.length;
        await book.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Error updating review" });
  }
};

// delete review to book id -> can delete only by existing reviewId
export const deleteReviewToBookId = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid Review ID" });
    }

    // Check if review exists and belongs to the user
    const review = await Review.findOneAndDelete({ _id: reviewId, userId });
    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    // remove review from book and update average ratings
    const book = await Book.findById(review.bookId);
    if (book) {
      book.reviews = book.reviews.filter((r) => r.userId.toString() !== userId);
      if (book.reviews.length > 0) {
        const totalRating = book.reviews.reduce((sum, r) => sum + r.rating, 0);
        book.averageRatings = totalRating / book.reviews.length;
      } else {
        book.averageRatings = 0;
      }
      await book.save();
    }

    // Remove review from user's reviewsAdded array
    await User.findByIdAndUpdate(userId, {
      $pull: { reviewsAdded: reviewId },
    });

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Error deleting review" });
  }
};

// get all books by author can enter start initials to map and case insensitive
export const getAllBooksByAuthor = async (req, res) => {
  try {
    const { author } = req.params;

    if (!author) {
      return res.status(400).json({ message: "Author name is required" });
    }

    const books = await Book.find({ author: new RegExp(author, "i") });

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found for this author" });
    }

    res.status(200).json({ success: true, books });
  } catch (error) {
    console.error("Error fetching books by author:", error);
    res.status(500).json({ error: "Error fetching books by author" });
  }
};

// get all books by genre can enter start initials to map and case insensitive
export const getAllBooksByGenre = async (req, res) => {
  try {
    const { genre } = req.params;

    if (!genre) {
      return res.status(400).json({ message: "Genre is required" });
    }

    const books = await Book.find({ genre: new RegExp(genre, "i") });

    if (books.length === 0) {
      return res.status(404).json({ message: "No books found for this genre" });
    }

    res.status(200).json({ success: true, books });
  } catch (error) {
    console.error("Error fetching books by genre:", error);
    res.status(500).json({ error: "Error fetching books by genre" });
  }
};