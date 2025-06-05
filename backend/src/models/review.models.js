import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  comment: {
    type: String
  }
}, {
  timestamps: true
});

reviewSchema.index({ book: 1, user: 1 }, { unique: true }); // Only one review per book per user

const Review = mongoose.model("Review", reviewSchema);
export default Review;