// Middleware that checks weather the the requested interaction is stored on the item

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Item from '../../models/item';
import ItemInteraction from '../../models/itemInteraction';
import ExpressError from '../ExpressError';
import catchAsync from '../catchAsync';
import { ItemInDB, ItemInteractionInDB } from '../../typeDefinitions';

const itemInteractionBelongsToItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get the item requested in the params or throw error if item does not exist
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

    // get interaction or throw error if interaction does not exist
    const interactionId = new mongoose.Types.ObjectId(req.params.interactionId);
    const interaction: ItemInteractionInDB | null =
      await ItemInteraction.findById(interactionId);
    if (interaction === null)
      return next(
        new ExpressError('Bad Request: This interaction does not exist', 400),
      );
    res.locals.interaction = interaction;

    // check if the given interactionId matches the interactions on the item
    if (!item.interactions.includes(interactionId)) {
      return next(
        new ExpressError(
          'Bad Request: The requested item and interaction do not match!',
          400,
        ),
      );
    }

    // TODO ER: could also use
    // item.interactions[item.interactions.length-1] === itemInteraction._id
    // TODO but then messaging in old interactions would not be possible any more

    return next();
  },
);

export default itemInteractionBelongsToItem;
