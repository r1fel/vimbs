// end of line functions when hitting user Routes

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// utils
import catchAsync from '../utils/catchAsync';

// models
import User from '../models/user';
import Item from '../models/item';
import { UserInDB } from '../typeDefinitions';
import ExpressError from '../utils/ExpressError';
import { ObjectId } from 'mongodb';

// simple auth for client route changes: isLoggedIn middleware ran previously
export const sendIsAuthenticated = (req: Request, res: Response) => {
  // console.log(`req.user in sendIsAuthenticated is ${req.user}`);
  res.send(req.user);
};

// register new user
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = new User({ email });
    const userInDB: UserInDB | null = await User.register(user, password);
    if (!userInDB)
      return next(new ExpressError('new user could not be created', 500));
    return next();
  },
);

// login existing user
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user: UserInDB | null = await User.findOne({ email: email });
    if (!user) return next(new ExpressError('user not found', 500));

    // console.log('usersItemsbefore:', user.myItems);

    // get rid of ItemIds in usersMyItems array, that were deleted since last login and possibly not pulled from the array
    const validMyItemIds: mongoose.Types.ObjectId[] = [];

    for (const itemId of user.myItems) {
      try {
        // Check if the item with the given ID exists in the database
        const itemExists = await Item.exists({ _id: itemId });

        if (itemExists) {
          validMyItemIds.push(itemId);
        }
      } catch (error) {
        console.error(
          `Error checking existence of item with ID ${itemId}: ${error}`,
        );
      }
    }

    // Update the user's myItems array with the valid item IDs
    user.myItems = validMyItemIds;

    // ! only intermediate function while setup of interactions
    user.getItems = [];

    // // get rid of ItemIds in usersGetItems array, that were deleted since last login and possibly not pulled from the array
    // const validGetItemIds: mongoose.Types.ObjectId[] = [];

    // for (const itemId of user.getItems) {
    //   try {
    //     // Check if the item with the given ID exists in the database
    //     const itemExists = await Item.exists({ _id: itemId });

    //     if (itemExists) {
    //       validGetItemIds.push(itemId);
    //     }
    //   } catch (error) {
    //     console.error(
    //       `Error checking existence of item with ID ${itemId}: ${error}`,
    //     );
    //   }
    // }

    // // Update the user's getItems array with the valid item IDs
    // user.getItems = validGetItemIds;
    await user.save();

    // console.log('usersItems after:', user.myItems);
    res.send(user);
  },
);

// logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.send('successfully logged out!');
};
