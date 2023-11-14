import {Router} from 'express';
import passport from 'passport';
import catchAsync from '../utils/catchAsync';
import isLoggedIn from '../utils/isLoggedIn';
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
  // validateUser
  //
  catchAsync(register),
  passport.authenticate('local', {
    //TODO FR: use failureFlash with tostify?
    failureMessage: true,
    // failureRedirect: 'http://localhost:5173/login',
  }),
  catchAsync(login)
);

userRoutes.route('/login').post(
  // storeReturnTo,
  passport.authenticate('local', {
    //TODO FR: use failureFlash with tostify?
    failureMessage: true,
    // failureRedirect: 'http://localhost:5173/login',
  }),
  catchAsync(login)
);

userRoutes.route('/changePassword').post(
  isLoggedIn,
  //
  catchAsync(changePassword)
);

userRoutes.route('/auth').get(
  isLoggedIn,
  //
  catchAsync(sendIsAuthenticated)
);

userRoutes.route('/logout').get(
  isLoggedIn,
  //
  catchAsync(logout)
);
