import {Router} from 'express';
import {
  index,
  createItem,
  itemSearch,
  showItem,
  updateItem,
  myInventory,
} from '../controllers/itemControllers';
import catchAsync from '../utils/catchAsync';

export const itemRoutes = Router();

itemRoutes
  .route('/')
  .get(
    // isLoggedIn,
    //
    catchAsync(index)
  )
  .post(
    // isLoggedIn,
    // validateItem,
    //
    catchAsync(createItem)
  );

itemRoutes.route('/search').get(
  // isLoggedIn,
  //
  catchAsync(itemSearch)
);

itemRoutes.route('/mine').get(
  // isLoggedIn,
  //
  catchAsync(myInventory)
);

itemRoutes
  .route('/:itemId')
  .get(
    // isLoggedIn,
    //
    catchAsync(showItem)
  )
  .put(
    // isLoggedIn,
    //  catchAsync(isOwner),
    // validateItem,
    //
    catchAsync(updateItem)
  );
// .delete(isLoggedIn, catchAsync(isOwner), catchAsync(items.deleteItem));
