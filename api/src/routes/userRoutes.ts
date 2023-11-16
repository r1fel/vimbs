// routes with base /user/:userId

import { Router } from 'express';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import isUser from '../utils/middleware/isUser';
import validatePasswordChange from '../utils/middleware/validatePasswordChange';

// controllers
import {
  settings,
  changePassword,
  myItems,
} from '../controllers/userControllers';

const userRoutes = Router({ mergeParams: true });
// "merge params" is need to pass the req.params from the app.use to the following routes
export default userRoutes;

userRoutes.route('/settings').post(
  isLoggedIn,
  isUser,
  //
  settings
);

userRoutes.route('/changePassword').post(
  isLoggedIn,
  isUser,
  validatePasswordChange,
  //
  changePassword
);

userRoutes.route('/inventory/myItems').get(
  isLoggedIn,
  isUser,
  //
  myItems
);
