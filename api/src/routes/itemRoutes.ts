// routes with base /item

import { Router } from 'express';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import validateItem from '../utils/middleware/validateItem';
import isOwner from '../utils/middleware/isOwner';

// controllers
import {
  index,
  createItem,
  itemSearch,
  showItem,
  updateItem,
  deleteItem,
} from '../controllers/itemControllers';

const itemRoutes = Router();
export default itemRoutes;

itemRoutes
  .route('/')
  .get(
    isLoggedIn,
    //
    index,
  )
  .post(
    isLoggedIn,
    // validateItem,
    //
    createItem,
  );

itemRoutes.route('/search').get(
  isLoggedIn,
  //
  itemSearch,
);

itemRoutes
  .route('/:itemId')
  .get(
    isLoggedIn,
    //
    showItem,
  )
  .put(
    isLoggedIn,
    isOwner,
    // validateItem,
    //
    updateItem,
  )
  .delete(
    isLoggedIn,
    isOwner,
    //
    deleteItem,
  );
