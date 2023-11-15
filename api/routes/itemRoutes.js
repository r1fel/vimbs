const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const items = require('../controllers/items');
const {isLoggedIn, validateItem, isOwner} = require('../middleware');

router
  .route('/')
  .get(
    // isLoggedIn,
    //
    catchAsync(items.index)
  )
  .post(
    // isLoggedIn,
    validateItem,
    //
    catchAsync(items.createItem)
  );

router.route('/search').get(
  // isLoggedIn,
  //
  catchAsync(items.itemSearch)
);

router.route('/mine').get(
  // isLoggedIn,
  //
  catchAsync(items.myInventory)
);

router
  .route('/:itemId')
  .get(
    // isLoggedIn,
    //
    catchAsync(items.showItem)
  )
  .put(
    // isLoggedIn,
    //  catchAsync(isOwner),
    validateItem,
    //
    catchAsync(items.updateItem)
  );
// .delete(isLoggedIn, catchAsync(isOwner), catchAsync(items.deleteItem));

module.exports = router;
