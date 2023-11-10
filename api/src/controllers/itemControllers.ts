import {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import {Item} from '../models/item';
import ExpressError from '../utils/ExpressError';
import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  UserInDB,
  ItemInDB,
} from '../typeDefinitions';
import {processItemForClient} from '../utils/processItemForClient';

// fetch all items from DB that don't belog to user and process for client
export const index = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  const items: PopulatedItemsFromDB = await Item.find({
    owner: {$ne: currentUser},
  })
    .populate<{owner: UserInDB}>('owner')
    .populate<{interactions: ItemInteractionInDB[]}>('interactions')
    .sort({name: 1});
  if (items === null)
    return next(new ExpressError('this item doesnt exist', 500));
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(items, currentUser, response);
  return res.send(response);
};

// create new item
export const createItem = async (req: Request, res: Response) => {
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  const item: ItemInDB = new Item(req.body.item);
  item.owner = currentUser;
  await item.save();
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(item, currentUser, response);
  return res.send(response);
};

// get item by itemId
export const showItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
  //   '6544bbe8df354e46068d74bb'
  // ); //bob
  // const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
  //   '6544bd1bdf354e46068d74bf'
  // ); //owner bibi
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bd2fdf354e46068d74c3'
  ); //bodo
  // const currentUser = req.user._id;
  const item: PopulatedItemsFromDB = await Item.findById(req.params.itemId)
    .populate<{owner: UserInDB}>('owner')
    .populate<{interactions: ItemInteractionInDB[]}>('interactions');
  if (item === null)
    return next(new ExpressError('this item doesnt exist', 500));
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(item, currentUser, response);
  return res.send(response);
};

// edit item by itemId
export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  const item: PopulatedItemsFromDB | null = await Item.findOneAndUpdate(
    {_id: req.params.itemId},
    {...req.body.item},
    {new: true}
  )
    .populate<{owner: UserInDB}>('owner')
    .populate<{interactions: ItemInteractionInDB[]}>('interactions');
  if (item === null)
    return next(new ExpressError('this item doesnt exist', 500));
  const response: ResponseItemForClient[] = [];
  processItemForClient(item, currentUser, response);
  return res.send(response);
};

// fetch users inventory from DB and process for client
export const myInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  const items: PopulatedItemsFromDB = await Item.find({owner: currentUser})
    .populate<{interactions: ItemInteractionInDB[]}>('interactions')
    .sort({title: 1});
  if (items === null)
    return next(new ExpressError('this item doesnt exist', 500));
  const response: Array<ResponseItemForClient> = [];
  processItemForClient(items, currentUser, response);
  return res.send(response);
};

//TODO ER FR : revise search logic
// search items by search term, fetch from DB that don't belog to user and process for client
export const itemSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  const items: PopulatedItemsFromDB = await Item.find({name: req.query.q})
    .populate<{owner: UserInDB}>('owner')
    .populate<{interactions: ItemInteractionInDB[]}>('interactions')
    .sort({name: 1});
  if (items === null)
    return next(new ExpressError('this item doesnt exist', 500));
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(items, currentUser, response);
  return res.send(response);
};
