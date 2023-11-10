// routes with base /item/:itemId/itemInteraction

import {Router} from 'express';
import catchAsync from '../utils/catchAsync';
import {
  createItemInteraction,
  deleteAllItemInteractions,
} from '../controllers/itemInteractionControllers';

export const itemInteractionRoutes = Router({mergeParams: true});
// "merge params" is need to pass the req.params from the app.use to the following routes

itemInteractionRoutes
  .route('/')
  .post(catchAsync(createItemInteraction))
  .delete(catchAsync(deleteAllItemInteractions));
