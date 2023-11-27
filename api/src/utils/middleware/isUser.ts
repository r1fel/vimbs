// Middleware that checks weather the the requesting user is the user of this user/:userId path

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ExpressError from '../ExpressError';

const isUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return next(new ExpressError('user is undefined', 500));
  const currentUser = req.user._id;
  const reqUserId = new mongoose.Types.ObjectId(req.params.userId);
  if (!currentUser.equals(reqUserId))
    return next(
      new ExpressError(
        'Unauthorized: You are not allowed to view this content!',
        403,
      ),
    );

  return next();
};
export default isUser;
