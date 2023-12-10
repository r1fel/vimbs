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
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );
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
    // console.log('new put request', req.body);
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

// deleting all item a user has from DB and empty owners myItems array
export const deleteAllOfUsersItems = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user === undefined)
      return next(new ExpressError('user is undefined', 500));

    const currentUser = req.user._id;
    const user: UserInDB | null = await User.findById(currentUser);

    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));

    if (user.myItems.length > 0) {
      // Delete all items owned by the user
      await Item.deleteMany({ owner: currentUser });

      // Empty out myItems array
      user.myItems = [];
      await user.save();
      return res.send('Successfully deleted all of your items!');
    }

    return res.send('You had no items to delete.');
  },
);

// suggest items for user
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
  items: PopulatedItemsFromDB[],
  numberOfItems: number = 2
): Promise<PopulatedItemsFromDB> => {
  if (!items || items.length === 0) 
    return Promise.resolve([]);
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
  user: UserInDB,
  thresh: number = 5
): Promise<PopulatedItemsFromDB> => {
  if (!accessibleItems) 
    return Promise.resolve([]);
  
  const searchHistory = user.searchHistory;
  if (!searchHistory || searchHistory.length < thresh) 
    return Promise.resolve([]);

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
  min_length_user_history: number = 5
): Promise<PopulatedItemsFromDB> => {
  
  if (!items || user.searchHistory.length < min_length_user_history || user.getHistory.length < min_length_user_history) 
    return Promise.resolve([]);

  // get search tokens from user search history
  const searchTokens: string[] = [];
  for (const searchData of user.searchHistory) {
    searchTokens.push(searchData.searchToken);
  }

  // get catagory of items, which were searched for in the past
  const SearchCategoryCounts = new Map<string, number>();
  for (const searchToken of searchTokens) {
    const filteredItems = items.filter(item => item.name === searchToken);
    for (const item of filteredItems) {
      const categories = item.categories; // Get all category names
      const keys = Object.keys(categories);
      for (const key of keys) {
        if (typeof categories[key].name === 'string') {
          SearchCategoryCounts.set(categories[key], (SearchCategoryCounts.get(categories[key]) || 0) + 1);
        }
      }
    }
  }

  // get top 3 catagories of items, which were searched for in the past
  const searchSubcategoryCounts = new Map<string, number>();
  SearchCategoryCounts.forEach((value: any, key: any) => {
    const subcategories = (key as any).subcategories;
    subcategories.forEach((subcategory: string) => {
        searchSubcategoryCounts.set(subcategory, (searchSubcategoryCounts.get(subcategory) || 0) + 1);
    });
  });

  const topSeachHistoryCategories = Array.from(searchSubcategoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  // get catagoires of items, which were borrowed in the past
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

  // get top 3 catagories of items, which were borrowed in the past
  const borrowSubcategoryCounts = new Map<string, number>();
  BorrowCategoryCounts.forEach((value: any, key: any) => {
    const subcategories = (key as any).subcategories;
    subcategories.forEach((subcategory: string) => {
      borrowSubcategoryCounts.set(subcategory, (borrowSubcategoryCounts.get(subcategory) || 0) + 1);
    });
  });

  const topBorrowCategories = Array.from(borrowSubcategoryCounts.entries()).sort((a, b) => b[1] - a[1]);

  // suggested items array
  const borrowSuggestedItems: any[] = Object.values(topBorrowCategories)
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

  const searchHistorySuggestedItems: any[] = Object.values(topSeachHistoryCategories)
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

  return Promise.resolve(borrowSuggestedItems.concat(searchHistorySuggestedItems));
};

export const WinterSubcategories = ['Winter Sports', 'Wintersport'];
export const SummerSubcategories = ['Baustellengeräte', 'Gartengeräte', 'Campingutensilien', 'Construction equipment', 'Gardening tools', 'Camping gear'];

export const filterItemsBySeason = (accessibleItems: any[]): Promise<PopulatedItemsFromDB> => {
  if (!accessibleItems || accessibleItems.length === 0) {
    return Promise.resolve([]);
  }

  const currentMonth = new Date().getMonth();
  const isWinter = currentMonth < 3 || currentMonth > 10;

  const filteredItems = accessibleItems.filter(item => {
    const categories = Object.values(item.categories) as { subcategories?: string[] }[];
    const subcategories = categories.flatMap(category => category.subcategories || []);

    if (isWinter) {
      // If it's winter, filter out items with summer subcategories
      return !subcategories.some(subcat => SummerSubcategories.includes(subcat));
    } else {
      // If it's summer, filter out items with winter subcategories
      return !subcategories.some(subcat => WinterSubcategories.includes(subcat));
    }
  });

  return Promise.resolve(filteredItems);
};



// Don't remove
// this function is only used for testing the helper functions above in itemControllers.test.ts
export const getPopulatItems = async (_id: any): Promise<PopulatedItemsFromDB> => {
  const currentUser = _id;
  const items: PopulatedItemsFromDB = await Item.find();
  return items;
};