const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const items = require('../controllers/items');
const {isLoggedIn} = require('../middleware');

router.route('/').get(
  // isLoggedIn,
  catchAsync(items.index)
);

module.exports = router;
