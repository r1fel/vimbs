// Middleware to check wether the user sending the request is logged in
import { Request, Response, NextFunction } from 'express';
import ExpressError from '../ExpressError';
import { isAuthenticated } from './functionForMocking';

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  // if (!req.isAuthenticated()) {
  if (!isAuthenticated(req)) {
    // res.redirect('http://localhost:5173/login');
    return next(new ExpressError('Unauthorized', 401));
  }
  console.log('Checking authentication status successful:');
  // console.log(req.user);
  return next();
};

export default isLoggedIn;
