import {Router} from 'express';
// import Item from '../models/item';
import {index, itemSearch, showItem} from '../controllers/itemControllers';

export const itemRoutes = Router();

itemRoutes.route('/').get(index);

itemRoutes.route('/search').get(itemSearch);

itemRoutes.route('/:itemId').get(showItem);
