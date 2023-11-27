// Middleware that checks weather the the requesting user is the owner of the item

import { Request, Response, NextFunction } from 'express';
import Item from '../../models/item';
import ExpressError from '../ExpressError';
import catchAsync from '../catchAsync';
import { ItemInDB } from '../../typeDefinitions';

const isOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;
    const item: ItemInDB | null = await Item.findById(req.params.itemId);
    if (item === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );
    if (!item.owner.equals(currentUser)) {
      return next(
        new ExpressError(
          'Forbidden: You do not have permission to do that!',
          403,
        ),
      );
    }

    return next();
  },
);

export default isOwner;
