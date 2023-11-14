// Request Validation Middleware: checks the sent user data from Login

import {Request, Response, NextFunction} from 'express';
import userLoginSchema from './schemas/userLoginSchema';
import ExpressError from '../ExpressError';

const validateUserLogin = (req: Request, res: Response, next: NextFunction) => {
  const {error} = userLoginSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validateUserLogin;
