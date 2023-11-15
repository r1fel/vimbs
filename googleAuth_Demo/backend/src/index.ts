import express from 'express';
import mongoose from 'mongoose';
// import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import User from './User';
import { IMongoDBUser } from './types';
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// setup .env
if (process.env.NODE_ENV !== 'production') {
  // Load environment variables from .env file if not in production
  require('dotenv').config();
}
// dotenv.config();

// setup of the MongoDbAtlas
const dbURL = `${process.env.DB_URL}oauth`;
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(
  session({
    secret: 'secretcode',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// according to Tutorial serialize/deserialize
// passport.serializeUser((user: any, done) => {
//   return done(null, user._id);
// });

// passport.deserializeUser((id: string, done: any) => {
//   User.findById(id)
//     .exec()
//     .then((doc) => {
//       return done(null, doc);
//     })
//     .catch((err) => {
//       return done(err, null);
//     });
// });

// according to Colt: serialize/deserialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: '/auth/google/callback',
    },
    function (accessToken: any, refreshToken: any, profile: any, cb: any) {
      User.findOne({ googleId: profile.id })
        .exec()
        .then((doc) => {
          if (!doc) {
            const newUser = new User({
              googleId: profile.id,
              username: profile.name.givenName,
            });

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
    }
  )
);

// passport.use(new LocalStrategy(User.authenticate()));

passport.use(
  new LocalStrategy(
    {
      passReqToCallBack: true,
    },
    function (username: string, password: string, done: any) {
      User.findOne({ username: username })
        .exec()
        .then(async function (user: any) {
          if (user) {
            User.authenticate();

            return done(null, user);
          }
          if (!user) {
            console.log('no user found');
            console.log(username);
            console.log(password);
            const newUser = new User({
              username: username,
            });
            await User.register(newUser, password);
          }
          console.log(user);
          return user;
        })
        .then((result) => {
          done(null, result);
        })
        .catch((err) => {
          done(err, null);
        });
    }
  )
);

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login',
  }),
  function (req, res) {
    // successful authentication, redirect home
    // res.send('you made it');
    res.redirect('http://localhost:3000');
  }
);

app.post(
  '/auth/username',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: 'http://localhost:3000',
  }),
  function (req, res) {
    // successful authentication, redirect home
    console.log('made login');
    res.redirect('http://localhost:3000');
  }
);

app.get('/', (req, res) => {
  res.send('hello world at home');
});

app.get('/getuser', (req, res) => {
  res.send(req.user);
});

app.get('/auth/logout', (req, res, next) => {
  if (req.user) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
    });
    res.send('done');
  }
});

app.listen(4000, () => {
  console.log('server started 4000');
});
