import {Router} from 'express';
import catchAsync from '../utils/catchAsync';
import isLoggedIn from '../utils/isLoggedIn';
import {
  index,
  createItem,
  itemSearch,
  showItem,
  updateItem,
  myInventory,
} from '../controllers/itemControllers';

const itemRoutes = Router();
export default itemRoutes;

itemRoutes
  .route('/')
  .get(
    isLoggedIn,
    //
    catchAsync(index)
  )
  .post(
    isLoggedIn,
    // validateItem,
    //
    catchAsync(createItem)
  );

itemRoutes.route('/search').get(
  isLoggedIn,
  //
  catchAsync(itemSearch)
);

itemRoutes.route('/mine').get(
  isLoggedIn,
  //
  catchAsync(myInventory)
);

itemRoutes
  .route('/:itemId')
  .get(
    isLoggedIn,
    //
    catchAsync(showItem)
  )
  .put(
    isLoggedIn,
    //  catchAsync(isOwner),
    // validateItem,
    //
    catchAsync(updateItem)
  );
// .delete(isLoggedIn, catchAsync(isOwner), catchAsync(items.deleteItem));
