// routes with base /auth

import { Router } from 'express';
import passport from 'passport';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import validateUserAuth from '../utils/middleware/validateUserAuth';

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
  validateUserAuth,
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
  validateUserAuth,
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
