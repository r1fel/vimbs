// end of line functions when hitting user Routes

import {Request, Response, NextFunction} from 'express';

// utils
import ExpressError from '../utils/ExpressError';
import catchAsync from '../utils/catchAsync';

// models
import User from '../models/user';

// register new user
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;
    const user = new User({email});
    await User.register(user, password);
    return next();
  }
);

// login existing user
export const login = catchAsync(async (req: Request, res: Response) => {
  const {email} = req.body;
  const user = await User.findOne({email: email});
  res.send(user);
});

// changePassword
export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return new ExpressError('user is undefined', 500);
    const user = await User.findById(req.user._id);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    const {oldPassword, newPassword} = req.body;
    if (oldPassword === newPassword)
      return next(new ExpressError('pick new password', 400));
    await user.changePassword(oldPassword, newPassword);
    await user.save();
    return res.status(200).send('successfully changed user data');
  }
);

// simple auth for client route changes: isLoggedIn middleware ran previously
export const sendIsAuthenticated = (req: Request, res: Response) => {
  res.send(true);
};

// logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.send('successfully logged out!');
};
