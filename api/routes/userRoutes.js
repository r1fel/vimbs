const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');

router
  .route('/register')
  // .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route('/login')
  // .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate('local', {
      failureFlash: true,
      // failureRedirect: '/login'
    }),
    catchAsync(users.login)
  );

//TODO ER: check how passport destroys the session
router.get('/logout', users.logout);

module.exports = router;
