import { Router } from 'express';
import {isLoggedIn} from '../middlewares/auth.middlewares.js';
import { addBook,getBooks, getBookById, addReviewToBookId, updateReviewToBookId,deleteReviewToBookId,getAllBooksByAuthor,getAllBooksByGenre } from '../controllers/book.controllers.js';

const bookRoutes=Router()

// adding book only logged in user can add book
bookRoutes.post('/addBook', isLoggedIn, addBook);

// get all books with an author name or genre name
bookRoutes.get('/getBooks', getBooks);

// get a single book by its id
bookRoutes.get('/getBook/:id', getBookById);

// adding review to a book of bookId -> creates a reviewId
bookRoutes.post('/review/book/:bookId', isLoggedIn, addReviewToBookId)

// updating review added by reviewId
bookRoutes.put('/update-review/:reviewId', isLoggedIn, updateReviewToBookId);

// deleting review added by reviewId
bookRoutes.delete('/delete-review/:reviewId', isLoggedIn, deleteReviewToBookId);

// get all books by author name, author initials
bookRoutes.get('/getAllBooks-by-author/:author', getAllBooksByAuthor);

// get all books by genre name, genre initials
bookRoutes.get('/getAllBooks-by-genre/:genre', getAllBooksByGenre);

export default bookRoutes