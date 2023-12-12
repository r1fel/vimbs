// routes with base /item/:itemId/itemInteraction

import { Router } from 'express';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import isNotOwner from '../utils/middleware/isNotOwner';
import isItemAvailable from '../utils/middleware/isItemAvaliable';

// controllers
import {
  createItemInteraction,
  deleteAllItemInteractions,
  dummyController, //! ER: remove when itemInteractions are set up
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
    // validateItemInteraction,
    //
    // createItemInteraction,
    dummyController,
  )
  .delete(deleteAllItemInteractions);
