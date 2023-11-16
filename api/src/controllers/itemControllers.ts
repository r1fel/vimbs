// end of line functions when hitting item Routes

import { Request, Response, NextFunction } from 'express';

// utils
import ExpressError from '../utils/ExpressError';
import processItemForClient from '../utils/processItemForClient';
import catchAsync from '../utils/catchAsync';

// models
import Item from '../models/item';

// Type-Definitions
import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  UserInDB,
  ItemInDB,
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
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(items, currentUser, response);
    return res.send(response);
  }
);

// create new item
export const createItem = catchAsync(async (req: Request, res: Response) => {
  if (req.user === undefined) return new ExpressError('user is undefined', 500);
  const currentUser = req.user._id;
  const item: ItemInDB = new Item({ name: req.body.item.name });
  if (req.body.item.picture) item.picture = req.body.item.picture;
  if (req.body.item.description) item.description = req.body.item.description;
  item.owner = currentUser;
  await item.save();
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(item, currentUser, response);
  return res.send(response);
});

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
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(item, currentUser, response);
    return res.send(response);
  }
);

// edit item by itemId
export const updateItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
    const currentUser = req.user._id;
    const item: PopulatedItemsFromDB | null = await Item.findOneAndUpdate(
      { _id: req.params.itemId },
      { ...req.body.item },
      { new: true }
    )
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions');
    if (item === null)
      return next(new ExpressError('this item doesnt exist', 500));
    const response: ResponseItemForClient[] = [];
    processItemForClient(item, currentUser, response);
    return res.send(response);
  }
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
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(items, currentUser, response);
    return res.send(response);
  }
);
