// Request Validation Middleware: checks the sent user data from Login

import {Request, Response, NextFunction} from 'express';
import userSchema from './schemas/userSchema';
import ExpressError from '../ExpressError';

const validateUserLogin = (req: Request, res: Response, next: NextFunction) => {
  const {error} = userSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validateUserLogin;
