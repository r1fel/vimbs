// end of line functions when hitting user Routes

import { Request, Response, NextFunction } from 'express';

// utils
import ExpressError from '../utils/ExpressError';
import catchAsync from '../utils/catchAsync';
import processItemForClient from '../utils/processItemForClient';

// models
import User from '../models/user';
import Item from '../models/item';

// Type-Definitions
import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  UserInDB,
  ChangeSettingsRequest,
} from '../typeDefinitions';

// change/ add user settings
export const setUserData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return new ExpressError('user is undefined', 500);
    const user: UserInDB | null = await User.findById(req.user._id);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    const newUserData: ChangeSettingsRequest = req.body.newUserData;
    if (newUserData.firstName) user.firstName = newUserData.firstName;
    if (newUserData.lastName) user.lastName = newUserData.lastName;
    if (newUserData.phone) user.phone = newUserData.phone;
    if (newUserData.address) user.address = newUserData.address;
    user.save();
    res.send(user);
  }
);

// changePassword
export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return new ExpressError('user is undefined', 500);
    const user = await User.findById(req.user._id);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    const { oldPassword, newPassword } = req.body;
    if (oldPassword === newPassword)
      return next(new ExpressError('pick new password', 400));
    await user.changePassword(oldPassword, newPassword);
    await user.save();
    return res.status(200).send('successfully changed password');
  }
);

// fetch users inventory from DB and process for client
export const myItems = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;
    const items: PopulatedItemsFromDB = await Item.find({ owner: currentUser })
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions')
      .sort({ title: 1 });
    if (items === null)
      return next(new ExpressError('this item doesnt exist', 500));
    const response: Array<ResponseItemForClient> = [];
    processItemForClient(items, currentUser, response);
    return res.send(response);
  }
);
