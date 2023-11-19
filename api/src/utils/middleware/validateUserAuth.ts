// Request Validation Middleware: checks the sent user data from Login

import { Request, Response, NextFunction } from 'express';
import userAuthSchema from './schemas/userAuthSchema';
import ExpressError from '../ExpressError';

const validateUserAuth = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userAuthSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validateUserAuth;
