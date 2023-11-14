// routes with base /item/:itemId/itemInteraction

import {Router} from 'express';
import catchAsync from '../utils/catchAsync';
import {
  createItemInteraction,
  deleteAllItemInteractions,
} from '../controllers/itemInteractionControllers';

const itemInteractionRoutes = Router({mergeParams: true});
// "merge params" is need to pass the req.params from the app.use to the following routes

export default itemInteractionRoutes;

itemInteractionRoutes
  .route('/')
  .post(catchAsync(createItemInteraction))
  .delete(catchAsync(deleteAllItemInteractions));
