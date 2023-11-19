// end of line functions when hitting user Routes

import { Request, Response, NextFunction } from 'express';

// utils
import catchAsync from '../utils/catchAsync';

// models
import User from '../models/user';
import { UserInDB } from '../typeDefinitions';
import ExpressError from '../utils/ExpressError';

// simple auth for client route changes: isLoggedIn middleware ran previously
export const sendIsAuthenticated = (req: Request, res: Response) => {
  res.send(req.user);
};

// register new user
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = new User({ email });
    const userInDB: UserInDB | null = await User.register(user, password);
    if (!userInDB)
      return next(new ExpressError('new user could not be created', 500));
    return next();
  },
);

// login existing user
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  res.send(user);
});

// logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.send('successfully logged out!');
};
