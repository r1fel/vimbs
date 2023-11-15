// routes with base /item/:itemId/itemInteraction

import {Router} from 'express';

// controllers
import {
  createItemInteraction,
  deleteAllItemInteractions,
} from '../controllers/itemInteractionControllers';

const itemInteractionRoutes = Router({mergeParams: true});
// "merge params" is need to pass the req.params from the app.use to the following routes
export default itemInteractionRoutes;

itemInteractionRoutes
  .route('/')
  .post(createItemInteraction)
  .delete(deleteAllItemInteractions);
