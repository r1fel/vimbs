import {Router} from 'express';
// import Item from '../models/item';
import {index} from '../controllers/items';

export const defaultRoute = Router();

defaultRoute.get('/', index);

// defaultRoute.get('/item', async (req: Request, res: Response) => {
//   const currentUser = '6544bbe8df354e46068d74bb';
//   // const currentUser = req.user._id;
//   const items = await Item.find({owner: {$ne: currentUser}})
//     .populate('owner')
//     // .populate('interactions')
//     .sort({name: 1});
//   // const response = [];
//   // processItemForClient(items, currentUser, response);
//   res.send(items);
// });
