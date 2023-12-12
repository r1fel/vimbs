// Middleware that checks weather the item is currently available

import { Request, Response, NextFunction } from 'express';
import Item from '../../models/item';
import ExpressError from '../ExpressError';
import catchAsync from '../catchAsync';
import { ItemInDB } from '../../typeDefinitions';

const isItemAvailable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const item: ItemInDB | null = await Item.findById(req.params.itemId);
    if (item === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );
    if (item.available === false)
      return next(
        new ExpressError(
          'Bad Request: This item is currently not available',
          400,
        ),
      );

    res.locals.item = item;
    return next();
  },
);

export default isItemAvailable;
