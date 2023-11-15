// routes with base /

import {Router} from 'express';
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
  changePassword,
} from '../controllers/userControllers';

const userRoutes = Router();
export default userRoutes;

userRoutes.route('/register').post(
  validateUser,
  //
  register,
  passport.authenticate('local', {
    //TODO FR: use failureFlash with tostify?
    failureMessage: true,
    // failureRedirect: 'http://localhost:5173/login',
  }),
  login
);

userRoutes.route('/login').post(
  validateUser,
  // storeReturnTo,
  //
  passport.authenticate('local', {
    //TODO FR: use failureFlash with tostify?
    failureMessage: true,
    // failureRedirect: 'http://localhost:5173/login',
  }),
  login
);

userRoutes.route('/changePassword').post(
  isLoggedIn,
  //
  changePassword
);

userRoutes.route('/auth').get(
  isLoggedIn,
  //
  sendIsAuthenticated
);

userRoutes.route('/logout').get(
  isLoggedIn,
  //
  logout
);
