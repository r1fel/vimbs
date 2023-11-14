// all required packages
import express, {Application, Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
// generic error handling function
//TODO ER: implement
import ExpressError from './utils/ExpressError';
// const ExpressError = require('./utils/ExpressError');
// TODO FR: needed for client
// import methodOverride from 'method-override';
// authentification session - for cookies
import session from 'express-session';
//TODO FR: need flash or go with react toastifiy
// import flash from 'connect-flash';
//authentification package
//TODO ER: google Login
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import cors from 'cors';

// Importing routes
// import bookRoutes from './routes/bookRoutes';
// import itemRoutes from './routes/itemRoutes';
// import reviewRoutes from './routes/reviewRoutes';
// import borrowingrequestRoutes from './routes/borrowingrequestRoutes';
import itemRoutes from './routes/itemRoutes';
import itemInteractionRoutes from './routes/itemInteractionRoutes';
import userRoutes from './routes/userRoutes';

// Importing models
import User from './models/user';

// setup .env
if (process.env.NODE_ENV !== 'production') {
  // Load environment variables from .env file if not in production
  require('dotenv').config();
}

// setup of the MongoDbAtlas
const dbURL = `${process.env.DB_URL}vimbs-dev`;
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

// general configurations
const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
// TODO FR: necessary with client
// app.use(methodOverride('_method'));

// TODO ER: revisit for making session work
const sessionConfig = {
  secret: 'thisshouldbeabettersecret!', // Secret for session
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Session expires in 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

// TODO FR see flash in general
// app.use(flash());

// Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// TODO ER: login fixen!!!
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req: Request, res: Response, next: NextFunction) => {
  //req.user used in controllers to get user info from request
  res!.locals!.currentUser = req.user;
  // TODO FR: verification sent by passport to be displayed client - react tostify
  // res.locals.success = req.flash('success');
  // res.locals.error = req.flash('error');
  next();
});

// Route necessities in routers folder
// app.use('/books', bookRoutes);
// app.use('/item', itemRoutes);
// app.use('/books/:id/reviews', reviewRoutes);
// app.use('/books/:id/borrowingrequest', borrowingrequestRoutes);

// routes
app.use('/', userRoutes);
app.use('/item', itemRoutes);
app.use('/item/:itemId/itemInteraction', itemInteractionRoutes);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err: any, req: Request, res: Response) => {
  const {statusCode = 500} = err;
  if (!err.message) err.message = 'Oh No, Something went wrong!';
  res.status(statusCode).send(err);
});

// general configurations
app.listen(8080, () => {
  console.log('Serving on port 8080');
});
