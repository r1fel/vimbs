// Request Validation Middleware: checks the sent item data

import { Request, Response, NextFunction } from 'express';
import userDataSchema from './schemas/userDataSchema';
import ExpressError from '../ExpressError';

const validateItem = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userDataSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validateItem;
