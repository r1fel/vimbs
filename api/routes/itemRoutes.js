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
    // isLoggedIn,
    catchAsync(items.showItem)
  )
  .put(
    //   isLoggedIn,
    //  catchAsync(isOwner),
    validateItem,
    catchAsync(items.updateItem)
  );
// .delete(isLoggedIn, catchAsync(isOwner), catchAsync(items.deleteItem));

module.exports = router;
