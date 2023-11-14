import {Request, Response, NextFunction} from 'express';
import User from '../models/user';
import ExpressError from '../utils/ExpressError';

// register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {email, username, password} = req.body;
  const user = new User({email, username});
  await User.register(user, password);
  return next();
};

// login existing user
export const login = async (req: Request, res: Response) => {
  const {username} = req.body;
  const user = await User.find({username: username});
  res.send(user);
};

// changePassword
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
};

// is Logged In ran through successful
export const sendIsAuthenticated = async (req: Request, res: Response) => {
  res.send(true);
};

// logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.send('successfully logged out!');
};
