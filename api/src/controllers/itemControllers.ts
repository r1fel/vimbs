import {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import {Item} from '../models/item';
// import {ItemInteraction} from '../models/itemInteraction';
import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  UserInDB,
} from '../typeDefinitions';
import {processItemForClient} from '../utils/processItemForClient';

//TODO ER FR : revise search logic
//TODO ER: use response more concious
// fetch all items from DB that don't belog to user and process for client
export const index = async (req: Request, res: Response) => {
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  const items: PopulatedItemsFromDB = await Item.find({
    owner: {$ne: currentUser},
  })
    .populate('owner')
    .populate('interactions')
    .sort({name: 1});
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(items, currentUser, response);
  res.send(response);
};

export const itemSearch = async (req: Request, res: Response) => {
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  const items: PopulatedItemsFromDB = await Item.find({name: req.query.q})
    .populate('owner')
    .populate('interactions')
    .sort({name: 1});
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(items, currentUser, response);
  res.send(response);
};

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
    .populate<{interactions: ItemInteractionInDB[]}>('interactions')
    .sort({name: 1});
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(item, currentUser, response);
  res.send(response);
};
