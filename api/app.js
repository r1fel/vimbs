// setup .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// all required packages
const express = require('express');
const mongoose = require('mongoose');
// generic error handling function
//TODO ER: implement
const ExpressError = require('./utils/ExpressError');
// TODO FR: needed for client
const methodOverride = require('method-override');
// authentification session - for cookies
const session = require('express-session');
//TODO FR: need flash or go with react toastifiy
const flash = require('connect-flash');
//authentification package
//TODO ER: google Login
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const cors = require('cors');

//Routes
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const itemRoutes = require('./routes/itemRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const borrowingrequestRoutes = require('./routes/borrowingrequestRoutes');

// setup of the MongoDbAtlas
//TODO ER change to VIMBS DB
const dbURL = `${process.env.DB_URL}vimbs-dev`;
// const dbURL = `${process.env.DB_URL}FriendsShelves`;
//mongodb://127.0.0.1:27017/friends-shelves
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

// general configurations
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
//TODO FR: necessary with client
app.use(methodOverride('_method'));

// TODO ER: revisit for making session work
const sessionConfig = {
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

// TODO FR see flash in general
app.use(flash());

// Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  //req.user used in controllers to get user info from request
  res.locals.currentUser = req.user;
  // TODO FR: verification sent by passport to be displayed client - react tostify
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Route necessities in routers folder
app.use('/', userRoutes);
app.use('/books', bookRoutes);
app.use('/item', itemRoutes);
app.use('/books/:id/reviews', reviewRoutes);
app.use('/books/:id/borrowingrequest', borrowingrequestRoutes);

// TODO ER: error handeling - revisit when client is setup to deal with some error messages
app.all('*', (req, res, next) => {
  // next(new ExpressError('Page Not Found', 404))
  console.log('some down the list error');
});

app.use((err, req, res, next) => {
  const {statusCode = 500} = err;
  if (!err.message) err.message = 'Oh No, Something went wrong!';
  // res.status(statusCode).render('error', { err });
  console.log('some down the list error');
});

// general configurations
app.listen(8080, () => {
  console.log('Serving on port 8080');
});
