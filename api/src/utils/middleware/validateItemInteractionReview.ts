// Request Validation Middleware: checks the sent itemInteraction data

import { Request, Response, NextFunction } from 'express';
import itemInteractionReviewSchema from './schemas/itemInteractionReviewSchema';
import ExpressError from '../ExpressError';

const validateItemInteractionReview = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = itemInteractionReviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(msg, 400));
  }
  return next();
};

export default validateItemInteractionReview;
