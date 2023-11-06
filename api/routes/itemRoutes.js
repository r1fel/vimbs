const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const items = require('../controllers/items');
const {isLoggedIn, validateItem, isOwner} = require('../middleware');

router
  .route('/')
  .get(
    // validation middleware:
    // isLoggedIn,
    // request handler:
    catchAsync(items.index)
  )
  .post(
    // validation middleware:
    // isLoggedIn,
    validateItem,
    // request handler:
    catchAsync(items.createItem)
  );

router.route('/search').get(
  // validation middleware:
  // isLoggedIn,
  // request handler:
  catchAsync(items.itemSearch)
);

router.get(
  '/mine',
  // validation middleware:
  // isLoggedIn,
  // request handler:
  catchAsync(items.myInventory)
);

router
  .route('/:itemId')
  .get(
    // validation middleware:
    // isLoggedIn,
    // request handler:
    catchAsync(items.showItem)
  )
  .put(
    // validation middleware:
    // isLoggedIn,
    //  catchAsync(isOwner),
    validateItem,
    // request handler:
    catchAsync(items.updateItem)
  );
// .delete(isLoggedIn, catchAsync(isOwner), catchAsync(items.deleteItem));

module.exports = router;
