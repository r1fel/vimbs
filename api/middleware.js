const ExpressError = require('./utils/ExpressError');
const {bookSchema, reviewSchema, borrowingrequestSchema} = require('./schemas');
const Book = require('./models/book');
const Review = require('./models/review');
const Borrowingrequest = require('./models/borrowingrequest');

// Esther: revisit when session is working
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // req.session.returnTo = req.originalUrl;
    // req.flash('error', 'You must be signed in first');
    // return res.redirect('/login');
    return res.send('sign in please');
  }
  // console.log('isLoggedIn just ran');
  next();
};

// Esther: useful when redirecting with session is working
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

//TODO ER error?
// validate the incoming data for book creation or updating with the book Joi Schema
module.exports.validateBook = (req, res, next) => {
  const {error} = bookSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    res.send(msg);
    // throw new ExpressError(msg, 400)
  }
  next();
};

// Esther: revisit when session is working
module.exports.isOwner = async (req, res, next) => {
  const {id} = req.params;
  const book = await Book.findById(id);
  if (!book.owner.equals(req.user._id)) {
    // req.flash('error', 'You do not have permission to do that!');
    // return res.redirect(`/books/${id}`)
    return res.send('sign in as book owner please');
  }
  // console.log('isOwner just ran');
  next();
};
// Esther: revisit when session is working
module.exports.isNotOwner = async (req, res, next) => {
  const {id} = req.params;
  const book = await Book.findById(id);
  if (book.owner.equals(req.user._id)) {
    // req.flash('error', 'You do not have permission to do that!');
    // return res.redirect(`/books/${id}`)
    return res.send(
      'This is your book! You cant do borrowing requests for it!',
    );
  }
  // console.log('isNotOwner just ran');
  next();
};

// Esther: revisit when session is working and we want to incorporate reviews
module.exports.isReviewWriter = async (req, res, next) => {
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
  if (!review.writer.equals(req.user._id)) {
    // req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// Esther: revisit when session is working and we want to incorporate reviews
module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    res.send(msg);
    // throw new ExpressError(msg, 400)
  } else {
    next();
  }
};

// validate the incoming data for borrowingrequest creation or updating with the borrowingrequest Joi Schema
module.exports.validateBorrowingrequest = (req, res, next) => {
  const {error} = borrowingrequestSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    res.send(msg);
    // throw new ExpressError(msg, 400)
  } else {
    next();
  }
};

module.exports.borrowingrequestBelongsToBook = async (req, res, next) => {
  const {id, borrowingrequestId} = req.params;
  const book = await Book.findById(id);
  if (book.borrowingrequests.includes(borrowingrequestId) === true) {
    return next();
  } else {
    // req.flash('error', 'Something went wrong with your request!');
    // return res.redirect(`/books/${id}`);
    return console.log('Something went wrong with your request!');
  }
};

// checks for new borrowingrequests, if the book is with the lender
module.exports.bookHasOngoingBorrowingrequest = async (req, res, next) => {
  const {id} = req.params;
  const book = await Book.findById(id).populate('borrowingrequests');
  if (book.borrowingrequests.length !== 0) {
    const indexLastBorrowingrequest = book.borrowingrequests.length - 1;
    if (
      ['backHome', 'declined'].includes(
        book.borrowingrequests[indexLastBorrowingrequest].bookLocation,
      )
    ) {
      return next();
    } else {
      // req.flash('error', 'your borrowingrequest failed, because the book is currently not at the lender.');
      return res.send(
        'your borrowingrequest failed, because the book is currently not at the lender.',
      );
    }
  }
  return next();
};
