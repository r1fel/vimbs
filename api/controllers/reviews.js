const Book = require('../models/book');
const Review = require('../models/review');

// Esther: useful, once we get to reviews
module.exports.createReview = async (req, res) => {
  const book = await Book.findById(req.params.id);
  const review = new Review(req.body.review);
  review.writer = req.user._id;
  book.reviews.push(review);
  await review.save();
  await book.save();
  // req.flash('success', 'Created new review!');
  // res.redirect(`/books/${book._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const {id, reviewId} = req.params;
  await Book.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  // req.flash('success', 'Successfully deleted a review!');
  // res.redirect(`/books/${id}`);
};
