// all required packages
import express, { Application, Request, Response, NextFunction } from 'express';
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
import { Strategy as LocalStrategy } from 'passport-local';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
import cors from 'cors';

// Importing routes
import itemRoutes from './routes/itemRoutes';
import itemInteractionRoutes from './routes/itemInteractionRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// Importing models
import User from './models/user';

// types
import { GoogleEmailObject, UserInDB } from './typeDefinitions';

// setup .env
if (process.env.NODE_ENV !== 'production') {
  // Load environment variables from .env file if not in production
  require('dotenv').config();
}

// wrapping app in a function to do dependency injection of the database, to be able to test with a mock DB
export default function (database: any) {
  // general configurations
  const app: Application = express();

  // Connect to the database when the application starts
  database
    .connectToDatabase()
    .then(() => {
      console.log('Database connected');
    })
    .catch((err: Error) => {
      console.error('Error connecting to the database:', err);
      process.exit(1); // Exit the application if the database connection fails
    });

  process.on('SIGINT', async () => {
    await database.closeDatabaseConnection();
    process.exit();
  });

  app.use(express.json());
  app.use(
    cors({
      // ! testing google Oauth
      origin: ['http://localhost:3000', `${process.env.CLIENT_URL}`],
      credentials: true,
    }),
  );
  // TODO FR: necessary with client
  // app.use(methodOverride('_method'));

  // TODO ER: revisit for making session work
  const sessionConfig = {
    secret: `${process.env.SESSION_SECRET}`,
    // ! ER: Google prototype has resave: true
    resave: true,
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
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // Use the email field instead of username
      },
      User.authenticate(),
    ),
  );

  // TODO ER: login fixen!!!
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function (_id: mongoose.Types.ObjectId, done) {
    User.findById(_id)
      .then((user: UserInDB | null) => {
        done(null, user);
      })
      .catch((err: Error) => {
        done(err, null);
      });
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: `${process.env.GOOGLE_CLIENT_ID}`,
        clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
        callbackURL: '/auth/google/callback',
      },
      function (accessToken: any, refreshToken: any, profile: any, cb: any) {
        // get users email from profile.emails
        // array from api
        const emails: GoogleEmailObject[] = profile.emails;
        // function to select either the first verified email from the array or if all emails are not verified, the last entry of the array
        function getGoogleEmail(
          emails: GoogleEmailObject[],
        ): string | undefined {
          const verifiedEmail = emails.find((email) => email.verified);

          if (verifiedEmail) {
            return verifiedEmail.value;
          } else if (emails.length > 0) {
            return emails[emails.length - 1].value;
          }
          // emails array was empty
          return undefined;
        }

        const googleEmail = getGoogleEmail(emails);

        User.findOne({ googleId: profile.id })
          .exec()
          .then((doc) => {
            if (!doc) {
              // console.log('hit !doc');
              const newUser = new User({
                googleId: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: googleEmail === undefined ? '' : googleEmail,
                profilePicture: profile.photos[profile.photos.length - 1].value,
              });
              // console.log(newUser);
              return newUser.save();
            }
            return doc;
          })
          .then((result) => {
            cb(null, result);
          })
          .catch((err) => {
            cb(err, null);
          });
      },
    ),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    //req.user used in controllers to get user info from request
    res!.locals!.currentUser = req.user;
    // TODO FR: verification sent by passport to be displayed client - react tostify
    // res.locals.success = req.flash('success');
    // res.locals.error = req.flash('error');
    next();
  });

  // routes
  app.use('/auth', authRoutes);
  app.use('/user/:userId', userRoutes);
  app.use('/item', itemRoutes);
  app.use('/item/:itemId/itemInteraction', itemInteractionRoutes);

  app.get(
    '/auth/google',
    // function (req, res, next) {
    //   console.log('hit auth/google');
    //   // next();
    // },
    passport.authenticate('google', {
      scope: ['email', 'profile'],
    }),
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: 'http://localhost:3000/login',
      // failureRedirect: `${process.env.CLIENT_URL}/auth`,
    }),
    function (req, res) {
      // successful authentication, redirect home
      res.redirect('http://localhost:3000');
      // res.redirect(${process.env.CLIENT_URL});
    },
  );

  app.get('/getuser', (req, res) => {
    // console.log('hit getuser');
    if (req.user) {
      res.send(req.user);
    }
  });

  app.get('/auth/logout', (req, res, next) => {
    // console.log('hit logout');
    if (req.user) {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
      });
      res.send('done');
    }
  });

  // Error Handeling
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new ExpressError('Page Not Found', 404));
  });

  app.use((err: any, req: Request, res: Response) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!';
    res.status(statusCode).send(err);
  });

  return app;
}
