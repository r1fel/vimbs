import {Request, Response, NextFunction} from 'express';
import {IItem, Item} from '../models/item';
import mongoose from 'mongoose';
import {processItemForClient} from '../utils/processItemForClient';
// const {processItemForClient} = require('../middleware');

export type DBItems = IItem | Array<IItem>;
export type ObjectId = String | mongoose.Types.ObjectId;
export interface ResponseItemForClient {
  _id: ObjectId;
  name: string;
  available: boolean;
  picture: string | null;
  description: string | null;
  dueDate: Date | null;
  owner: boolean;
  interactions: null; // add itemInteraction[] |
  commonCommunity: {
    _id: ObjectId;
    picture: string;
    name: string;
  } | null;
  ownerData: {
    _id: ObjectId;
    firstName: string;
  } | null;
}

//TODO ER FR : revise search logic
//TODO ER: use response more concious
// fetch all items from DB that don't belog to user and process for client
export const index = async (req: Request, res: Response) => {
  const currentUser: ObjectId = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const items: DBItems = await Item.find({
    owner: {$ne: currentUser},
  })
    .populate('owner')
    // .populate('interactions')
    .sort({name: 1});
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(items, currentUser, response);
  res.send(response);
};

export const itemSearch = async (req: Request, res: Response) => {
  const currentUser: ObjectId = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const items: DBItems = await Item.find({name: req.query.q})
    .populate('owner')
    // .populate('interactions')
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
  const currentUser: ObjectId = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  try {
    const item: DBItems | null = await Item.findById(req.params.itemId)
      .populate('owner')
      // .populate('interactions')
      .sort({name: 1});
    let items: IItem;
    if (item === null) {
      const error = {statusCode: 330, message: 'not item found'};
      // throw Error('this item doesnt exist');
      next(error);
    } else {
      items = item;
      let response: Array<ResponseItemForClient> = [];
      processItemForClient(items, currentUser, response);
      res.send(response);
    }
  } catch (err) {
    next(err);
  }
};
