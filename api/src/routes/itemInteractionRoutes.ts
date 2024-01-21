// routes with base /item/:itemId/itemInteraction

import { Router } from 'express';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import isNotOwner from '../utils/middleware/isNotOwner';
import isOwner from '../utils/middleware/isOwner';
import isItemAvailable from '../utils/middleware/isItemAvaliable';
import validateItemInteraction from '../utils/middleware/validateItemInteraction';
import itemInteractionBelongsToItem from '../utils/middleware/itemInteractionBelongsToItem';
import isInteractionPartaker from '../utils/middleware/isInteractionPartaker';
import isItemInteractionClosed from '../utils/middleware/isItemInteractionClosed';
import validateItemInteractionReview from '../utils/middleware/validateItemInteractionReview';

// controllers
import {
  createItemInteraction,
  deleteAllItemInteractions,
  deleteItemInteraction,
  handlePostInteraction,
  reviewInteraction,
} from '../controllers/itemInteractionControllers';

const itemInteractionRoutes = Router({ mergeParams: true });
// "merge params" is need to pass the req.params from the app.use to the following routes
export default itemInteractionRoutes;

itemInteractionRoutes
  .route('/')
  .post(
    isLoggedIn,
    isItemAvailable,
    isNotOwner,
    validateItemInteraction,
    //
    createItemInteraction,
  )
  .delete(deleteAllItemInteractions);

itemInteractionRoutes
  .route('/:interactionId')
  .post(
    isLoggedIn,
    itemInteractionBelongsToItem,
    isInteractionPartaker,
    validateItemInteraction,
    //
    handlePostInteraction,
  )
  .delete(
    isLoggedIn,
    isItemAvailable,
    itemInteractionBelongsToItem,
    isOwner,
    //
    deleteItemInteraction,
  );

itemInteractionRoutes.route('/:interactionId/review').post(
  isLoggedIn,
  itemInteractionBelongsToItem,
  isInteractionPartaker,
  isItemInteractionClosed,
  validateItemInteractionReview,
  //
  reviewInteraction,
);
