// Middleware that checks weather the the requesting user is NOT the owner of the item

import { Request, Response, NextFunction } from 'express';
import Item from '../../models/item';
import ExpressError from '../ExpressError';
import catchAsync from '../catchAsync';
import { ItemInDB } from '../../typeDefinitions';

const isNotOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;
    if (!res.locals.item) {
      // set res.locals.item
      const item: ItemInDB | null = await Item.findById(req.params.itemId);
      if (item === null)
        return next(
          new ExpressError('Bad Request: This item does not exist', 400),
        );
      res.locals.item = item;
    }

    const item: ItemInDB = res.locals.item;

    if (item.owner.equals(currentUser)) {
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

export default isNotOwner;
