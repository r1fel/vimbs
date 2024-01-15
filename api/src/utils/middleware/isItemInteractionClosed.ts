// Middleware that checks weather the the requested interaction is closed,
//  since opened/accepted/declined interactions are not to be reviewed

import { Request, Response, NextFunction } from 'express';
import ItemInteraction from '../../models/itemInteraction';
import ExpressError from '../ExpressError';
import catchAsync from '../catchAsync';
import { ItemInteractionInDB } from '../../typeDefinitions';

// string definitions
import { itemInteractionStatuses } from '../itemInteractionStringDefinitons';

const isItemInteractionClosed = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get the interactions requested in the params or throw error if interaction does not exist
    if (!res.locals.interaction) {
      // set res.locals.interaction
      const interaction: ItemInteractionInDB | null =
        await ItemInteraction.findById(req.params.interactionId);
      if (interaction === null)
        return next(
          new ExpressError('Bad Request: This interaction does not exist', 400),
        );
      res.locals.interaction = interaction;
    }
    const interaction: ItemInteractionInDB = res.locals.interaction;

    // check if the status of the interaction equals closed
    const closed = itemInteractionStatuses[3];
    if (interaction.interactionStatus !== closed) {
      return next(
        new ExpressError(
          'Bad Request: This operation is not allowed on the requested interaction',
          400,
        ),
      );
    }

    return next();
  },
);

export default isItemInteractionClosed;
