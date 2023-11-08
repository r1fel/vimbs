import {Request, Response, NextFunction} from 'express';
import {Item} from '../models/item';
// import {ItemInteraction} from '../models/itemInteraction';
import ExpressError from '../utils/ExpressError';
import {DBItems, ObjectId, ResponseItemForClient} from '../typeDefinitions';
import {processItemForClient} from '../utils/processItemForClient';

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
    .populate('interactions')
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
  const currentUser: ObjectId = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const item: DBItems | null = await Item.findById(req.params.itemId)
    .populate('owner')
    .populate('interactions')
    .sort({name: 1});
  if (item === null)
    return next(new ExpressError('this item doesnt exist', 500));
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(item, currentUser, response);
  res.send(response);
};
