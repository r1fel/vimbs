// routes with base /auth

import { Router } from 'express';
import passport from 'passport';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import validateUser from '../utils/middleware/validateUser';

// controllers
import {
  register,
  login,
  sendIsAuthenticated,
  logout,
} from '../controllers/authControllers';

const authRoutes = Router();
export default authRoutes;

authRoutes.route('/').get(
  isLoggedIn,
  //
  sendIsAuthenticated,
);

authRoutes.route('/register').post(
  validateUser,
  //
  register,
  passport.authenticate('local', {
    //TODO FR: use failureFlash with tostify?
    failureMessage: true,
    // failureRedirect: 'http://localhost:5173/login',
  }),
  login,
);

authRoutes.route('/login').post(
  validateUser,
  // storeReturnTo,
  //
  passport.authenticate('local', {
    //TODO FR: use failureFlash with tostify?
    failureMessage: true,
    // failureRedirect: 'http://localhost:5173/login',
  }),
  login,
);

authRoutes.route('/logout').post(
  isLoggedIn,
  //
  logout,
);
