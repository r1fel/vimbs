// end of line functions when hitting item Routes

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// utils
import ExpressError from '../utils/ExpressError';
import processItemForClient from '../utils/processItemForClient';
import catchAsync from '../utils/catchAsync';

// models
import Item from '../models/item';
import User from '../models/user';

// Type-Definitions
import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  UserInDB,
  ItemInDB,
  ItemRequest,
} from '../typeDefinitions';

// fetch all items from DB that don't belog to user and process for client
export const index = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;
    const items: PopulatedItemsFromDB = await Item.find({
      owner: { $ne: currentUser },
    })
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions')
      .sort({ name: 1 });
    if (items === null)
      return next(new ExpressError('this item doesnt exist', 500));
    // process for client
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(items, currentUser, response);
    return res.send(response);
  },
);

// create new item
export const createItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;
    const newItem: ItemRequest = req.body.item;
    // create item for saving to DB
    const item: ItemInDB = new Item({
      name: newItem.name,
      categories: newItem.categories,
    });
    if (newItem.picture) item.picture = newItem.picture;
    if (newItem.description) item.description = newItem.description;
    // item.categories = newItem.categories;
    item.owner = currentUser;
    // add item._id to user.myItems
    const user: UserInDB | null = await User.findById(currentUser);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    if (!user.myItems.includes(item._id)) {
      user.myItems.push(item._id);
      await user.save();
    }
    // save item (after pushing to user, in case error of user not found happens)
    await item.save();
    // process for client
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(item, currentUser, response);
    return res.send(response);
  },
);

// get item by itemId
export const showItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;
    const item: PopulatedItemsFromDB = await Item.findById(req.params.itemId)
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions');
    if (item === null)
      return next(new ExpressError('this item doesnt exist', 500));
    // process for client
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(item, currentUser, response);
    return res.send(response);
  },
);

// edit item by itemId
// TODO ER: if description or pictrure are not given, they are set to the value null in the DB
// TODO nicer would be to have the key value pair removed off the object - but $unset wouldn't work for me here, when I tried
export const updateItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('new put request', req.body);
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;

    // define the item details that is supposed to be updated.
    // if picture or description are not supplied, since they are optional, there value is to be set to null
    const updatedItem = {
      ...req.body.item,
      description: req.body.item.description ? req.body.item.description : null,
      picture: req.body.item.picture ? req.body.item.picture : null,
    };

    const item: PopulatedItemsFromDB | null = await Item.findOneAndUpdate(
      { _id: req.params.itemId },
      updatedItem,
      { new: true },
    )
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions');
    if (item === null)
      return next(new ExpressError('this item doesnt exist', 500));
    // process for client
    const response: ResponseItemForClient[] = [];
    processItemForClient(item, currentUser, response);
    return res.send(response);
  },
);

//TODO ER FR : revise search logic
// search items by search term, fetch from DB that don't belog to user and process for client
export const itemSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;
    const items: PopulatedItemsFromDB = await Item.find({ name: req.query.q })
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions')
      .sort({ name: 1 });
    if (items === null)
      return next(new ExpressError('this item doesnt exist', 500));
    // process for client
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(items, currentUser, response);
    return res.send(response);
  },
);

// deleting am item from DB and pull it from owners myItems array
export const deleteItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemId = new mongoose.Types.ObjectId(req.params.itemId);
    if (req.user === undefined)
      return next(new ExpressError('user is undefined', 500));
    const currentUser = req.user._id;
    const user: UserInDB | null = await User.findById(currentUser);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    if (user.myItems.includes(itemId)) {
      (user.myItems as any).pull(itemId);
      await user.save();
    }
    await Item.findByIdAndDelete(itemId);
    // req.flash('success', 'Successfully deleted a item!');
    res.send(`Successfully deleted item ${itemId}!`);
  },
);
