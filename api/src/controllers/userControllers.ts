// end of line functions when hitting user Routes

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// utils
import ExpressError from '../utils/ExpressError';
import catchAsync from '../utils/catchAsync';
import processItemForClient from '../utils/processItemForClient';

// models
import User from '../models/user';
import Item from '../models/item';
import Notification from '../models/notification';

// Type-Definitions
import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  UserInDB,
  ChangeSettingsRequest,
  NotificationInDB,
  ItemInDB,
} from '../typeDefinitions';

// change/ add user settings
export const setUserData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return new ExpressError('Unauthorized', 500);
    const user: UserInDB | null = await User.findById(req.user._id);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    const newUserData: ChangeSettingsRequest = req.body.newUserData;
    user.firstName = newUserData.firstName;
    user.lastName = newUserData.lastName;
    user.phone = newUserData.phone;
    user.address = newUserData.address;
    user.profilePicture = newUserData.profilePicture;
    user.save();
    res.send(user);
  },
);

// changePassword
export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return new ExpressError('Unauthorized', 500);
    const user = await User.findById(req.user._id);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    const { oldPassword, newPassword } = req.body;
    if (oldPassword === newPassword)
      return next(new ExpressError('pick new password', 400));
    await user.changePassword(oldPassword, newPassword);
    await user.save();
    return res.status(200).send('successfully changed password');
  },
);

// fetch users inventory from DB and process for client
export const myItems = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined) return new ExpressError('Unauthorized', 500);
    const currentUser = req.user._id;
    const items: PopulatedItemsFromDB = await Item.find({ owner: currentUser })
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions')
      .sort({ title: 1 });
    if (items === null) return res.send([]);
    const response: Array<ResponseItemForClient> = [];
    processItemForClient(items, currentUser, response);
    return res.send(response);
  },
);

//! test function only needed for the scope of coding the notifications
export const notificationSetup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;

    const item: ItemInDB | null = await Item.findById(
      '6553bc9a22932b85d2937a53',
    );
    if (item === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );

    const notification: NotificationInDB = new Notification();
    notification.body.headline = 'bodies headline';
    notification.body.text = 'bodies text';
    notification.item = item._id;
    notification.itemPicture = item.picture;

    await notification.save();

    // const notification = '65b41c25ce85e522d1e4249e';

    await User.updateOne(
      { _id: currentUser },
      { $addToSet: { 'notifications.unread': notification } },
    );

    // console.log(notification);
    res.send('you passed notification controller');
  },
);

// function to toggle a notification between read and unread
export const notificationReadToggle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;

    const notificationId = new mongoose.Types.ObjectId(
      req.params.notificationId,
    );

    const notification: NotificationInDB | null = await Notification.findById(
      notificationId,
    );
    if (notification === null)
      return next(
        new ExpressError('Bad Request: This notification does not exist', 400),
      );

    // send message back and forth between read and unread array upon toggle
    let updatedUser: UserInDB | null = null;
    if (notification.read === true) {
      updatedUser = await User.findOneAndUpdate(
        { _id: currentUser },
        {
          $pull: { 'notifications.read': notificationId },
          $addToSet: { 'notifications.unread': notificationId },
        },
        { new: true },
      );
    } else if (notification.read === false) {
      updatedUser = await User.findOneAndUpdate(
        { _id: currentUser },
        {
          $pull: { 'notifications.unread': notificationId },
          $addToSet: { 'notifications.read': notificationId },
        },
        { new: true },
      );
    }

    // toggle read bool on notification
    notification.read = !notification.read;
    await notification.save();
    console.log(notification);

    //! put the process user function here and when getting the user, populate all the notifications
    res.send(updatedUser);
  },
);

// remove all notifications on a user and all orphaned notifications
export const deleteAllOfUsersNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //anything connected to the requesting user
    if (req.user === undefined)
      return next(new ExpressError('user is undefined', 500));

    const currentUser = req.user._id;
    const user: UserInDB | null = await User.findById(currentUser);

    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));

    //delete notification
    for (const notification of [
      ...user.notifications.read,
      ...user.notifications.unread,
    ]) {
      await Notification.findOneAndDelete(notification); //notification is pulled from users array by default
    }

    await user.save();

    // delete all orphaned notifications, that are still in the DB, but not on an item
    // Step 1: Get all notification IDs from the database
    const allNotificationIds = await Notification.find({}, '_id');

    // Step 2: Loop through the array and check if associated user exist
    for (const notificationId of allNotificationIds) {
      const user = await Item.findOne({
        $or: [
          { 'notifications.read': notificationId },
          { 'notifications.unread': notificationId },
        ],
      });

      // If no user is found with the notificationId in its notifications arrays, delete the notification
      if (!user) {
        await Notification.findByIdAndDelete(notificationId);
        console.log(`Deleted orphaned notification with ID: ${notificationId}`);
      }
    }

    return res.send(
      'successfully removed all of users and all orphaned notifications', //!
    );
  },
);

// remove a user by his id from the mongoDB
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      req.body.deletionPW !==
      'ifYouDontKnowThisPWToBeSentInTheBody,YouAreNotAllowedToDeleteAnyUsers'
    )
      return next(new ExpressError('You are not allowed to delete Users', 403));
    await User.findByIdAndDelete(req.params.userId);
    return res.send('successfully removed user from the MongoDB');
  },
);
