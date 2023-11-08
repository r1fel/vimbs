import {Request, Response} from 'express';
import Item from '../models/item';
// const {processItemForClient} = require('../middleware');

//TODO ER FR : revise search logic
//TODO ER: use response more concious
// fetch all items from DB that don't belog to user and process for client
export const index = async (req: Request, res: Response) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const items = await Item.find({owner: {$ne: currentUser}})
    .populate('owner')
    // .populate('interactions')
    .sort({name: 1});
  // const response = [];
  // processItemForClient(items, currentUser, response);
  res.send(items);
};
