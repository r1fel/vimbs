// Middleware to check wether the user sending the request is logged in
import {Request, Response, NextFunction} from 'express';

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    // res.redirect('http://localhost:5173/login');
    return res.send(false);
  }
  // console.log('isLoggedIn just ran');
  return next();
};

export default isLoggedIn;
