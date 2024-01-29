// routes with base /user/:userId

import { Router } from 'express';

// middleware
import isLoggedIn from '../utils/middleware/isLoggedIn';
import isUser from '../utils/middleware/isUser';
import validatePasswordChange from '../utils/middleware/validatePasswordChange';
import validateUserData from '../utils/middleware/validateUserData';

// controllers
import {
  setUserData,
  changePassword,
  myItems,
  notificationSetup,
  notificationReadToggle,
  deleteAllOfUsersNotifications,
  deleteUser,
} from '../controllers/userControllers';

const userRoutes = Router({ mergeParams: true });
// "merge params" is need to pass the req.params from the app.use to the following routes
export default userRoutes;

userRoutes.route('/settings').put(
  isLoggedIn,
  isUser,
  validateUserData,
  //
  setUserData,
);

userRoutes.route('/changePassword').post(
  isLoggedIn,
  isUser,
  validatePasswordChange,
  //
  changePassword,
);

userRoutes.route('/inventory/myItems').get(
  isLoggedIn,
  isUser,
  //
  myItems,
);

userRoutes
  .route('/notification')
  .get(
    isLoggedIn,
    isUser,
    //
    notificationSetup,
  )
  .delete(
    isLoggedIn,
    isUser,
    //
    deleteAllOfUsersNotifications,
  );

userRoutes.route('/notification/:notificationId').get(
  isLoggedIn,
  isUser,
  // isNotification,
  //
  notificationReadToggle,
);

userRoutes.route('/deleteUser').delete(deleteUser);
