// Request Validation Middleware: checks the sent user data for Register

import {Request, Response, NextFunction} from 'express';
import userRegisterSchema from './schemas/userRegisterSchema';
import ExpressError from '../ExpressError';

const validateUserRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {error} = userRegisterSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validateUserRegister;
