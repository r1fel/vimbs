// Request Validation Middleware: checks the sent itemInteraction data

import { Request, Response, NextFunction } from 'express';
import itemInteractionSchema from './schemas/itemInteractionSchema';
import ExpressError from '../ExpressError';

const validateItemInteraction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = itemInteractionSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validateItemInteraction;
