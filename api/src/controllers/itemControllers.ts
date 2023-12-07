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
import { isConstructorDeclaration } from 'typescript';

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

// TODO beschreibe den rückgabe wert und füge noch begrenzung ein in den individuellen funktionen
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


      const most_borrowed_items = await getMostBorrowedItems(items);
      const search_history_items = await getSearchHistoryItems(items, req.user as UserInDB);
      const catagory_items = await getItemsBasedOnCatagories(items, req.user as UserInDB);
      const random_items = await getRandomItems(items);


      const response_borrowed_items: Array<ResponseItemForClient> = [];
      const response_history_items: Array<ResponseItemForClient> = [];
      const response_catagory_items: Array<ResponseItemForClient> = [];
      const response_random_items: Array<ResponseItemForClient> = [];

      processItemForClient(most_borrowed_items, currentUser, response_borrowed_items);
      processItemForClient(search_history_items, currentUser, response_history_items);
      processItemForClient(catagory_items, currentUser, response_catagory_items);
      processItemForClient(random_items, currentUser, response_random_items);

      const response: Array<Array<ResponseItemForClient>> = [response_borrowed_items, response_history_items, response_catagory_items, response_random_items]
      
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


// TODO: naming überdenken sondercases null cases mitdenken
// get items based on catagories
export const getItemsBasedOnCatagories = (
  items: any[],
  user: any,
  thresh: number = 10
): Promise<PopulatedItemsFromDB> => {
  
  if (!items || user.searchHistory.length < thresh) 
    return Promise.resolve([]);

  // emtpy array
  const searchTokens: string[] = [];
  for (const searchData of user.searchHistory) {
    searchTokens.push(searchData.searchToken);
  }

  const SearchCategoryCounts = new Map<string, number>();

  for (const searchToken of searchTokens) {
    const filteredItems = items.filter(item => item.name === searchToken);
    for (const item of filteredItems) {
      const categories = item.categories; // Get all category names
      const keys = Object.keys(categories);
      for (const key of keys) {
        const subcategories = categories[key].subcategories;
        if (typeof categories[key].name === 'string') {
          // count category and subcategory
          SearchCategoryCounts.set(categories[key], (SearchCategoryCounts.get(categories[key]) || 0) + 1);
        }
      }
    }
  }

  const searchSubcategoryCounts = new Map<string, number>();

  SearchCategoryCounts.forEach((value: any, key: any) => {
    const subcategories = (key as any).subcategories;
    subcategories.forEach((subcategory: string) => {
        searchSubcategoryCounts.set(subcategory, (searchSubcategoryCounts.get(subcategory) || 0) + 1);
    });
  });

  const topSeachHistoryCategories = Array.from(searchSubcategoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  const BorrowCategoryCounts = new Map<string, number>();
  const borrowedObjectIds = user.getHistory;
  for (const objectId of borrowedObjectIds) {
      const item = items.find(item => item._id.toString() === objectId.toString());
      const categories = item.categories; // Get all category names
      const keys = Object.keys(categories);
      for (const key of keys) {
        const subcategories = categories[key].subcategories;
        if (typeof categories[key].name === 'string') {
          // count category and subcategory
          BorrowCategoryCounts.set(categories[key], (BorrowCategoryCounts.get(categories[key]) || 0) + 1);
        }
      }
    
  }

  const historySubcategoryCounts = new Map<string, number>();

  BorrowCategoryCounts.forEach((value: any, key: any) => {
    const subcategories = (key as any).subcategories;
    subcategories.forEach((subcategory: string) => {
      historySubcategoryCounts.set(subcategory, (historySubcategoryCounts.get(subcategory) || 0) + 1);
    });
  });

  const topHistoryCategories = Array.from(historySubcategoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  // suggested items array
  const historySuggestedItems: any[] = Object.values(topHistoryCategories)
  .filter(([_, count]) => count > 1)
  .flatMap(([subcategory]) =>
    Object.keys(items[0].categories)
      .flatMap(key =>
        items
          .filter(item =>
            item.categories &&
            item.categories[key] &&
            item.categories[key].subcategories &&
            item.categories[key].subcategories.includes(subcategory)
          )
      )
  );

  const searchSuggestedItems: any[] = Object.values(topHistoryCategories)
  .filter(([_, count]) => count > 1)
  .flatMap(([subcategory]) =>
    Object.keys(items[0].categories)
      .flatMap(key =>
        items
          .filter(item =>
            item.categories &&
            item.categories[key] &&
            item.categories[key].subcategories &&
            item.categories[key].subcategories.includes(subcategory)
          )
      )
  );

  return Promise.resolve(historySuggestedItems.concat(searchSuggestedItems));
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