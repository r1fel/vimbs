// Middleware that checks weather the the requesting user is either the item.owner or the iteraction.interestedParty

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Item from '../../models/item';
import ItemInteraction from '../../models/itemInteraction';
import ExpressError from '../ExpressError';
import catchAsync from '../catchAsync';
import { ItemInDB, ItemInteractionInDB } from '../../typeDefinitions';

const isInteractionPartaker = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;
    // get the item requested in the params
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

    // get interaction requested in the params
    const interactionId = new mongoose.Types.ObjectId(req.params.interactionId);
    if (!res.locals.interaction) {
      // set res.locals.interaction
      const interaction: ItemInteractionInDB | null =
        await ItemInteraction.findById(interactionId);
      if (interaction === null)
        return next(
          new ExpressError('Bad Request: This interaction does not exist', 400),
        );
      res.locals.interaction = interaction;
    }
    const interaction: ItemInteractionInDB = res.locals.interaction;

    // before passing to next, check if the requesting user is either owner or interestedParty
    if (
      !item.owner.equals(currentUser) &&
      !interaction.interestedParty.equals(currentUser)
    ) {
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

export default isInteractionPartaker;
