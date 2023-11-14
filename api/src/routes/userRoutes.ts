// routes with base /

import {Router} from 'express';
import passport from 'passport';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import validateUserRegister from '../utils/middleware/validateUserRegister';
import validateUserLogin from '../utils/middleware/validateUserLogin';

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
  validateUserRegister,
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
  validateUserLogin,
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
