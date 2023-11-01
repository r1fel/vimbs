// const { not } = require('joi');
const Book = require('../models/book');

//TODO ER FR : revise search logic
//TODO ER: use response more concious
// react version of: send all books that don't belong to the user to FE
module.exports.index = async (req, res) => {
  const currentUser = req.user._id;
  const response = await Book.find({owner: {$ne: currentUser}})
    .populate('borrowingrequests')
    .sort({title: 1});
  const books = response.map(
    ({_id, title, author, isbn, image, blurb, borrowingrequests}) =>
      // For initial display _id + imgage, for hoverinfo author + blurb needed, for search title + isbn + author needed
      // for buttons (later not needed on index), owner needed
      ({
        _id,
        title,
        author,
        isbn,
        image,
        blurb,
        owner: false,
        available:
          borrowingrequests.length === 0 ||
          borrowingrequests[borrowingrequests.length - 1].bookLocation ===
            ('backHome' && 'declined')
            ? true
            : false,
        dueDate:
          borrowingrequests.length === 0 ||
          borrowingrequests[borrowingrequests.length - 1].bookLocation ===
            ('backHome' && 'declined')
            ? ''
            : borrowingrequests[borrowingrequests.length - 1].dueDate,
      }),
  );
  res.send(books);
  // Future version with decision making based on more vaiables:
  // entry for did user already read this, is this on watchlist, gift/lending/permanentLend, available/dueDate
  // {
  // _id,
  //  title,
  //  author,
  //  isbn,
  //  image,
  //  blurb,
  //  "owner": false,
  //  "previouslyRead": true,
  //  "watchlist": false,
  //  "gift": false,
  //  "lending": true,
  //  "permanentLend": false,
  //  "availabe": false,
  //  "dueDate": 2023-12-15
  //  }
};

// react version of: send all books of a user to FE
module.exports.myIndex = async (req, res) => {
  const currentUser = req.user._id;
  const response = await Book.find({owner: currentUser})
    .populate('borrowingrequests')
    .sort({title: 1});
  const books = response.map(
    ({_id, title, author, isbn, image, blurb, borrowingrequests}) => ({
      _id,
      title,
      author,
      isbn,
      image,
      blurb,
      owner: true,
      available:
        borrowingrequests.length === 0 ||
        borrowingrequests[borrowingrequests.length - 1].bookLocation ===
          ('backHome' && 'declined')
          ? true
          : false,
      dueDate:
        borrowingrequests.length === 0 ||
        borrowingrequests[borrowingrequests.length - 1].bookLocation ===
          ('backHome' && 'declined')
          ? ''
          : borrowingrequests[borrowingrequests.length - 1].dueDate,
    }),
  );
  res.send(books);
};

// react version of: post request handeling for a new book
module.exports.createBook = async (req, res, next) => {
  const book = new Book(req.body.book);
  book.owner = req.user._id;
  await book.save();
  // const response = await Book.findById(book._id);
  const refactoredBook = {
    _id: book._id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    image: book.image,
    blurb: book.blurb,
    owner: true,
    available: true,
    dueDate: '',
  };
  // req.flash('success', 'Successfully created a new book!');
  res.send(refactoredBook);
};

// Esther to Alex: Also toggle on isLogged in in the routes, once you start using this at the FE
module.exports.showBook = async (req, res) => {
  // const requserid = '64f09610fcc82a3f318948fc';
  // const requserid = '64f0969dfcc82a3f3189491a';
  // const requserid = '64f096b7fcc82a3f31894921';
  // Esther to Alex: comment the above 3 line3 and uncomment the following line - I'll then do the clean up, when the FE stands
  const requserid = req.user._id;
  const response = await Book.findById(req.params.id)
    .populate('borrowingrequests')
    .populate('owner');
  //TODO ER: !response as middleware -global
  if (!response)
    // req.flash('error', 'Cannot find that book!');
    return res.send('book not found');

  const reqUsersLastBorrowingrequest =
    response.borrowingrequests[
      response.borrowingrequests
        .map(({borrower}) => borrower)
        .findLastIndex((borrowerId) => borrowerId.equals(requserid))
    ];

  const book = {
    _id: response._id,
    title: response.title,
    author: response.author,
    isbn: response.isbn,
    image: response.image,
    blurb: response.blurb,
    available:
      response.borrowingrequests.length === 0 ||
      ['backHome', 'declined'].includes(
        response.borrowingrequests[response.borrowingrequests.length - 1]
          .bookLocation,
      )
        ? true
        : false,
    dueDate:
      response.borrowingrequests.length === 0 ||
      ['backHome', 'declined'].includes(
        response.borrowingrequests[response.borrowingrequests.length - 1]
          .bookLocation,
      )
        ? ''
        : response.borrowingrequests[response.borrowingrequests.length - 1]
            .dueDate,
  };

  if (response.owner._id.equals(requserid)) {
    book.owner = true;
    book.borrowingrequests = response.borrowingrequests;
  } else if (reqUsersLastBorrowingrequest) {
    book.owner = false;
    book.borrowingrequests = [reqUsersLastBorrowingrequest];
    book.ownerId = ['home', 'declined'].includes(
      reqUsersLastBorrowingrequest.bookLocation,
    )
      ? ''
      : response.owner._id;
    book.ownerUsername = ['home', 'declined'].includes(
      reqUsersLastBorrowingrequest.bookLocation,
    )
      ? ''
      : response.owner.username;
  } else {
    book.owner = false;
  }
  return res.send(book);
};

// react version of: put request handeling for updating a book
module.exports.updateBook = async (req, res) => {
  const {id} = req.params;
  await Book.findByIdAndUpdate(id, {...req.body.book});
  const response = await Book.findOne({_id: id}).populate('borrowingrequests');
  const book = {
    _id: response._id,
    title: response.title,
    author: response.author,
    isbn: response.isbn,
    image: response.image,
    blurb: response.blurb,
    available:
      response.borrowingrequests.length === 0 ||
      response.borrowingrequests[response.borrowingrequests.length - 1]
        .bookLocation === ('backHome' && 'declined')
        ? true
        : false,
    dueDate:
      response.borrowingrequests.length === 0 ||
      response.borrowingrequests[response.borrowingrequests.length - 1]
        .bookLocation === ('backHome' && 'declined')
        ? ''
        : response.borrowingrequests[response.borrowingrequests.length - 1]
            .dueDate,
    owner: true,
    borrowingrequests: response.borrowingrequests,
  };
  // req.flash('success', 'Successfully updated this book!');
  res.send(book);
};

// react version of: deleting a book
module.exports.deleteBook = async (req, res) => {
  const {id} = req.params;
  await Book.findByIdAndDelete(id);
  // req.flash('success', 'Successfully deleted a book!');
  res.send('Successfully deleted a book!');
};
