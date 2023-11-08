import {Router} from 'express';
// import Item from '../models/item';
import {index, itemSearch, showItem} from '../controllers/itemControllers';
import catchAsync from '../utils/catchAsync';
import {createItemInteraction} from '../controllers/itemInteractionControllers';

export const itemRoutes = Router();

itemRoutes.route('/').get(catchAsync(index));

itemRoutes.route('/search').get(catchAsync(itemSearch));

itemRoutes.route('/:itemId').get(catchAsync(showItem));

itemRoutes
  .route('/:itemId/itemInteraction')
  .post(catchAsync(createItemInteraction));
