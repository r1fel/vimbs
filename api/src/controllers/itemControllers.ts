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
  ItemInDBPopulated,
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

// return items, whose name includes the query (autocompletion)
export const itemSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500); 
    const currentUser = req.user._id;
    const query: string = req.query.q as string;
    const items: PopulatedItemsFromDB = await Item.find({ owner: { $ne: currentUser } })
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions')
      .sort({ name: 1 });
    if (!items || items.length === 0)
      return next(new ExpressError('No items found', 404));
    const suggestions = items.filter((item: any) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    suggestions.sort((a: any, b: any) => {
      const indexA = a.name.toLowerCase().indexOf(query.toLowerCase());
      const indexB = b.name.toLowerCase().indexOf(query.toLowerCase());
      return indexA === -1 ? 1 : indexB === -1 ? -1 : indexA - indexB;
    });
    return res.send(suggestions);
  } 
);

// deleting am item from DB and pull it from owners myItems array
export const deleteItem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemId = new mongoose.Types.ObjectId(req.params.itemId);
    if (req.user === undefined)
      return new ExpressError('user is undefined', 500);
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

// TODO currently a mess, define what we want to suggest and not only test
export const suggestItems = catchAsync(
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
        
      // get random items and most borrowed items
      const most_borrowed_items = await getMostBorrowedItems(items);
      const random_items = await getRandomItems(items);
      //const seaarch_history_items = await getSearchHistoryItems(items, req.user);
      //const catagory_items = await getItemsBasedOnCatagories(items, req.user);
      
      //console.log("history" , seaarch_history_items);

      const response_one: Array<ResponseItemForClient> = [];
      const response_two: Array<ResponseItemForClient> = [];
      const response_three: Array<ResponseItemForClient> = [];
      processItemForClient(random_items, currentUser, response_one);
      processItemForClient(most_borrowed_items, currentUser, response_two);
      //processItemForClient(seaarch_history_items, currentUser, response_three);

      const response: Array<Array<ResponseItemForClient>> = [response_one, response_two];
      
      return res.send(response);
  } 
);

// ----------------- Helper functions for suggestItems -----------------

// get random items
export const getRandomItems = (
  items: PopulatedItemsFromDB,
  numberOfItems: number = 2
): Promise<PopulatedItemsFromDB> => {
  if (!items) 
    return Promise.resolve(null);
  const randomItems = Item.aggregate([{ $sample: { size: numberOfItems}}]).exec(); 
  return randomItems;
};

// get most borrowed items
export const getMostBorrowedItems = async (
  items: ItemInDBPopulated[],
  numberOfItems: number = 2
): Promise<ItemInDBPopulated[]> => {
  if (!items || items.length === 0) 
    return Promise.resolve([]);

  // Sort the items based on the number of interactions in descending order
  const sortedItems = items.sort((a, b) => {
    const aInteractions = a.interactions ?? [];
    const bInteractions = b.interactions ?? [];
    return bInteractions.length - aInteractions.length;
  });
  // Get the top N items with the most interactions
  const mostUsedItems = sortedItems.slice(0, numberOfItems);
  return mostUsedItems;
};

// returns items, which were searched for in the past, 
// but didn't exist back then
export const getSearchHistoryItems = (
  accessibleItems: ItemInDBPopulated[],
  user: UserInDB
): Promise<PopulatedItemsFromDB> => {
  if (!accessibleItems) 
    return Promise.resolve([]);
  
  const searchHistory = user.searchHistory;
  const interestingItems: PopulatedItemsFromDB = [];
  for (const searchData of user.searchHistory) {
    const items = accessibleItems.filter(
      (item) => item.name === searchData.searchToken
    );
    for (const item of items) {
      if (item.creationDate > searchData.date) {
        interestingItems.push(item);
      }
    }
  }
  return Promise.resolve(interestingItems);
};

// TODO: Could not be tested because of missing history
// TODO: check case if user has valid history
// get items based on catagories
export const getItemsBasedOnCatagories = (
  items: any[],
  user: any,
): Promise<PopulatedItemsFromDB> => {
  
  if (!items) 
    throw new Error('No accessible items found');

  // get catagories of items from user search history
  const search_history_catagories = user.searchHistory.map((item: any) => item.name);
  // find top three most used catagories
  const topThreeSearchCatagories = search_history_catagories.sort((a: any, b: any) =>
    search_history_catagories.filter((v: any) => v === a).length -
    search_history_catagories.filter((v: any) => v === b).length
  ).slice(0, 3);

  // get catagories based on user borrow history
  const borrow_history_catagories = user.getHistory.map((item: any) => item.categories);
  // find top three most used catagories
  const topThreeBorrowCatagories = borrow_history_catagories.sort((a: any, b: any) =>
    borrow_history_catagories.filter((v: any) => v === a).length -
    borrow_history_catagories.filter((v: any) => v === b).length
  ).slice(0, 3);
  
  // find available items based on catagories
  const suggestedItems = items.filter((item: any) => {
    if (item.categories.some((catagory: any) => topThreeSearchCatagories.includes(catagory))) {
      return true;
    }
    if (item.categories.some((catagory: any) => topThreeBorrowCatagories.includes(catagory))) {
      return true;
    }
    return false;
  }
  );
  return Promise.resolve(suggestedItems);
};

// TODO: check logic and token words again
// filter items out based on season
export const filterItemsBySeason = (
  accessibleItems: any[],
): Promise<PopulatedItemsFromDB> => {
  if (!accessibleItems || accessibleItems.length === 0) {
    throw new Error('No accessible items found');
  }

  const currentMonth = new Date().getMonth();
  let filteredItems: any[];

  if (currentMonth < 3 || currentMonth > 10) {
    // Winter -> Don't show items related to 'Gartengeräte'
    filteredItems = accessibleItems.filter((item) => {
      const categories = Object.values(item.categories);
      const isGartengerate = categories.some((category: any) => {
        if (
          category &&
          category.subcategories &&
          Array.isArray(category.subcategories)
        ) {
          return category.subcategories.includes('Gartengeräte');
        }
        return false;
      });
      return !isGartengerate;
    });
  } else {
    // Summer -> Don't show items related to 'Winter Sports'
    filteredItems = accessibleItems.filter((item) => {
      const categories = Object.values(item.categories);
      const isWinterSports = categories.some((category: any) => {
        if (
          category &&
          category.subcategories &&
          Array.isArray(category.subcategories)
        ) {
          return category.subcategories.includes('Winter Sports');
        }
        return false;
      });
      return !isWinterSports;
    });
  }

  return Promise.resolve(filteredItems);
};

// Don't remove
// this function is only used for testing the helper functions above in itemControllers.test.ts
export const getPopulatItems = async (_id: any): Promise<PopulatedItemsFromDB> => {
  const currentUser = _id;
  const items: PopulatedItemsFromDB = await Item.find();
  return items;
};