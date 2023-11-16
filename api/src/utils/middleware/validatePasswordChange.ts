// Request Validation Middleware: checks the sent item data

import { Request, Response, NextFunction } from 'express';
import passwordChangeSchema from './schemas/passwordChangeSchema';
import ExpressError from '../ExpressError';

const validatePasswordChange = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = passwordChangeSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validatePasswordChange;
