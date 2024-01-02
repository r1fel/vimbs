import mongoose from 'mongoose';
import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import ExpressError from '../../src/utils/ExpressError';
import { ResponseItemForClient } from '../../src/typeDefinitions';
import {  filterItemsBySeason, 
          getRandomItems, 
          getMostBorrowedItems, 
          getSearchHistoryItems, 
          getPopulatItems, 
          getItemsBasedOnCatagories,
          WinterSubcategories,
          SummerSubcategories } from '../../src/controllers/itemControllers';
import { ItemInDBPopulated, UserInDB} from '../../src/typeDefinitions'; // Replace 'path/to/ItemInDBPopulated' with the actual path
import exp from 'constants';


const app = makeApp(database);

// expected items, which are required for the tests

// getSearchHistoryItems expects at least one item in DB to be an item with name 'Fahrrad'
const expected_history_items = 'Fahrrad';

// getItemsBasedonCatagory expects at least one item in DB to be an item with name 'Fahrrad'
const expected_catagory_items = 'Fahrrad';

// getItemsBasedonCatagory expects at least one item in DB to be an item with id '6553bc9a22932b85d2937a53'
const expected_catagory_item_id = '6553bc9a22932b85d2937a53'


// routes
const loginRoute = '/auth/login';
const logoutRoute = '/auth/logout';
const itemRoute = '/item';
const itemSearchRoute = '/item/search';
const itemSuggestRoute = '/item/suggest';

const itemId = new mongoose.Types.ObjectId(); // TODO: remove when changed in file
let globalUserBodo: UserInDB;

// mocks
jest.mock('../../src/utils/ExpressError');

// frequently used functions
const loginBodo4 = async () => {
    const loginBodo4Response = await request(app).post(loginRoute).send({
      email: 'bodo4@gmail.com',
      password: 'bodo4',
    });
    // Access the headers and get the 'set-cookie' header
    const setCookieHeader = loginBodo4Response.headers['set-cookie'];
    // Extract the connect.sid value from the 'set-cookie' header
    const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];
    // console.log('connect.sid value:', connectSidValue);
    globalUserBodo = loginBodo4Response.body
  
    return connectSidValue;
};

const logout = async (connectSidValue: string) => {
  await request(app)
    .post(logoutRoute)
    .set('Cookie', [`connect.sid=${connectSidValue}`]);
};

const loginUser = async (email: string, password: string) => {
  const loginUserResponse = await request(app).post(loginRoute).send({
    email: email,
    password: password,
  });
  // Access the headers and get the 'set-cookie' header
  const setCookieHeader = loginUserResponse.headers['set-cookie'];
  // Extract the connect.sid value from the 'set-cookie' header
  const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];
  // console.log('connect.sid value:', connectSidValue);

  return connectSidValue;
};

// pass in the route which is protected by the isLoggedIn middleware
// test, that middleware is doing it's route protecting properly
const notPassedIsLoggedIn = (httpVerb: string, route: string) => {
  const invalidConnectSidValue =
    's%3AnFsjM4XUm0O8fA0JrqIKBQFDjTOp538v.uJgEmwcCkUfu1fIRpleL0DTM58naHwgEzD5gDw%2B82tY';

  describe('when isLoggedIn was not passed', () => {
    it('should respond error with a statusCode401 if req.user undefined', async () => {
      const response = await (request(app) as any)[httpVerb](route);

      expect(ExpressError).toHaveBeenCalledWith('Unauthorized', 401);
      expect(ExpressError).toHaveBeenCalledTimes(1);
    });
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      expect(ExpressError).toHaveBeenCalledWith('Unauthorized', 401);
      expect(ExpressError).toHaveBeenCalledTimes(1);
    });
  });
};

const notPassedIsOwner = (httpVerb: string, route: string) => {
    describe('when isOwner was not passed', () => {
      describe('when valid itemId is given', () => {
        it('should respond error with a statusCode403 if user is not item.owner', async () => {
          // login bodo4 and create his item:
          // login bodo4
          const connectSidValueBodo4First = await loginBodo4();
          // create item as bodo4
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send({
              item: {
                name: 'Item from Test of isOwner',
                categories: { Other: { subcategories: ['Sonstiges'] } },
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
          // extract itemId
          const itemId = createItemResponse.body[0]._id;
          // logout bodo4
          await logout(connectSidValueBodo4First);
  
          // try to do something on bodo4's item as bibi
          // login bibi
          const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');
          // try route in question
          const response = await (request(app) as any)
            [httpVerb](`${route}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
  
          expect(ExpressError).toHaveBeenCalledWith(
            'Forbidden: You do not have permission to do that!',
            403,
          );
          expect(ExpressError).toHaveBeenCalledTimes(1);
  
          // logout bibi
          await logout(connectSidValueBibi);
  
          // delete item again:
          // login bodo4
          const connectSidValueBodo4Second = await loginBodo4();
          // delete item
          const deleteItemResponse = await request(app)
            .delete(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
          // logout bodo4
          await logout(connectSidValueBodo4Second);
  
          // expect route in question to throw 403 with error message
        }, 10000);
      });
    });
  };

const checkResponseToBeCorrectlyProcessedItemForClient = ({
    validBody,
    interactions,
    commonCommunity,
  }: {
    validBody: ResponseItemForClient | ItemInDBPopulated;
    interactions: string[] | null;
    commonCommunity: {
      _id: string;
      picture: string;
      name: string;
    } | null;
  }) => {
    const correctlyProcessedItemForClient = {
      _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
      name: validBody.name,
      available: true,
      picture: validBody.picture || null,
      description: validBody.description || null,
      categories: {
        AdultClothing: {
          name: 'Mode',
          subcategories:
            validBody.categories.AdultClothing?.subcategories ?? [],
        },
        ChildAndBaby: {
          name: 'Kind und Baby',
          subcategories:
            validBody.categories.ChildAndBaby?.subcategories ?? [],
        },
        HouseAndGarden: {
          name: 'Haus und Garten',
          subcategories:
            validBody.categories.HouseAndGarden?.subcategories ?? [],
        },
        MediaAndGames: {
          name: 'Medien und Spiele',
          subcategories:
            validBody.categories.MediaAndGames?.subcategories ?? [],
        },
        Other: {
          name: 'Sonstiges',
          subcategories: validBody.categories.Other?.subcategories ?? [],
        },
        SportAndCamping: {
          name: 'Sport und Camping',
          subcategories:
            validBody.categories.SportAndCamping?.subcategories ?? [],
        },
        Technology: {
          name: 'Technik und Zubehör',
          subcategories:
            validBody.categories.Technology?.subcategories ?? [],
        },
      },
      owner: {
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        phone: {
            countryCode: expect.any(String),
            },
        myItems: expect.any(Array),
        getItems: expect.any(Array),
        getHistory: expect.any(Array),
        email: expect.any(String),
        creationDate: expect.any(String),
        searchHistory: expect.any(Array),
        __v: expect.any(Number),
      },
      interactions: expect.any(Array),
      creationDate: expect.any(String),
      __v: expect.any(Number),
    };

    return correctlyProcessedItemForClient;
  };

  const checkHelpferFunctionResponse = (item: ItemInDBPopulated) => {

    function isCategoryUndefined(value: any): boolean {
        return typeof value === 'object' || value === undefined;
      }

      function isPictureUndefined(value: any): boolean {
          return typeof value === 'string' || value === undefined;
      }

      function isItemidString(value: any): boolean {
        return typeof value === 'string' || value === 'object';
      }
    
      function isOwnerObject(value: any): boolean {
        return typeof value === 'boolean' || (typeof value === 'object' && value !== null);
      }

      function isInteractionsArray(value: any): boolean {
        return typeof value === 'object' || value === null;
      }

    expect(isPictureUndefined(item.picture)).toBe(true);
    expect(item.name).toEqual(expect.any(String));
    expect(item.description).toEqual(expect.any(String));
    expect(isCategoryUndefined(item.categories)).toBe(true);
    expect(isOwnerObject(item.owner)).toBe(true);
    expect(isInteractionsArray(item.interactions)).toBe(true);
    expect(item.available).toEqual(expect.any(Boolean));
  };

describe('item Routes', () => {
    // close DB after tests ran - to get rid of db related error
    afterAll(async () => {
      await database.closeDatabaseConnection();
    });

    describe(`GET ${itemSearchRoute} (itemSearch)`, () => {
        notPassedIsLoggedIn('post', itemRoute);
        describe('for itemSearch', () => {
          it('should respond successful with a statusCode200 and return list of available item names', async () => {
    
            const connectSidValue = await loginBodo4();

            // test results for different search tokens
            const searchTokens = ['a', 'Fa', 'jsdhjfodsf', '+++6//8389***##!!!′′^^^', ''];
    
            for(const searchToken of searchTokens) {
              const itemSearchResponse = await request(app)
              .get(itemSearchRoute)
              .query({ q: searchToken})
              .set('Cookie', [`connect.sid=${connectSidValue}`]);
              
              // Assert the response code
              expect(itemSearchResponse.status).toBe(200);
              //expect response body to be an array
              expect(itemSearchResponse.body).toBeInstanceOf(Array);

              if (itemSearchResponse.body.length > 0) {
                const itemSearchItem = itemSearchResponse.body[0];
                expect(itemSearchItem).toEqual(
                    checkResponseToBeCorrectlyProcessedItemForClient({
                      validBody: itemSearchItem,
                      interactions: [],
                      commonCommunity: null,
                    }),
                  ); 
              }
            }
          await logout(connectSidValue);
        }, 10000);
      });
    });

    describe(`GET ${itemSuggestRoute} (suggestItems)`, () => {

      describe('when avialble items exist', () => {
        const expectedNumberOfItems = 10;
          it('should respond successful with a statusCode200 and return an array of ' + String(expectedNumberOfItems) + ' items', async () => {
            const connectSidValue = await loginBodo4();
            const suggestItemsResponse = await request(app)
              .get(itemSuggestRoute)
              .set('Cookie', [`connect.sid=${connectSidValue}`]);
            expect(suggestItemsResponse.status).toBe(200);
            expect(suggestItemsResponse.body.length).toEqual(expectedNumberOfItems);
            if (Array.isArray(suggestItemsResponse.body)) {
              for (const item of suggestItemsResponse.body) {
                  checkHelpferFunctionResponse(item);
              }
          }
      });
    });
  });

  describe(`helper functions of suggestItems`, () => {

        notPassedIsLoggedIn('post', itemRoute);
        
        // Test individual helper functions
        describe('getRandomItems for valid input', () => {
          it('should return an array of random selected items', async () => {
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
            let itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items.filter(item => item !== null) as ItemInDBPopulated[] : [items].filter(item => item !== null) as ItemInDBPopulated[];
            const random_items = await getRandomItems(itemsArray, 3) ?? [];
            expect(random_items).toBeInstanceOf(Array);
            if (Array.isArray(random_items)) {
                for (const item of random_items) {
                    checkHelpferFunctionResponse(item);
                }
            }
            await logout(connectSidValue);
          }, 10000);
        });
    
        describe('getRandomItems for empty input', () => {
          it('should return an empty array', async () => {
            const connectSidValue = await loginBodo4();
            const random_items = await getRandomItems([], 3);
            expect(random_items).toBeInstanceOf(Array)
            expect(random_items).toEqual([]);
            await logout(connectSidValue);
          }, 10000);
        });
    
        describe('getMostBorrowedItems for valid input', () => {
          it('should return an array of items with most interactions in descending order', async () => {
            
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
            let itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items.filter(item => item !== null) as ItemInDBPopulated[] : [items].filter(item => item !== null) as ItemInDBPopulated[];
            const itemIds = [];

            for (let i = 0; i < itemsArray.length && i < 5; i++) {
              itemsArray[i].interactions = new Array(i + 1).fill(itemId);
              itemIds.push(itemsArray[i]._id);
            }
    
            const mostBorrowedItems = await getMostBorrowedItems(itemsArray);
            expect(mostBorrowedItems).toBeInstanceOf(Array);
            for (const item of mostBorrowedItems) {
              checkHelpferFunctionResponse(item);
              expect(item.interactions).not.toEqual([]);
              
            }

            // check if first five items are the ones with most interactions
            for (let i = 0; i < mostBorrowedItems.length && i < 5; i++) {
              expect(mostBorrowedItems[i]._id).toEqual(itemIds[4-i]);
            }

            await logout(connectSidValue);
          }, 10000);
        });
    
        describe('getMostBorrowedItems for empty input', () => {
          it('should return an empty array', async () => {
            const connectSidValue = await loginBodo4();
            const mostBorrowedItems = await getMostBorrowedItems([]);
            expect(mostBorrowedItems).toBeInstanceOf(Array);
            expect(mostBorrowedItems).toEqual([]);
            await logout(connectSidValue);
          }, 10000);
        });
    
        describe('getSearchHistoryItems for valid input', () => {
          it('should return items, which names match the search token and their creation dates are newer than the search date', async () => {
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
            const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);
    
            if (globalUserBodo.searchHistory.length > 0){
              globalUserBodo.searchHistory = [] as unknown as [{ searchToken: string; date: Date; }];
            }
          
            globalUserBodo?.searchHistory.push({ searchToken: expected_history_items, date: getRandomDateIn1950() });


            const searchHistoryItems = await getSearchHistoryItems(itemsArray, globalUserBodo);
            expect(searchHistoryItems).toBeInstanceOf(Array);
            
            if (searchHistoryItems.length > 0) {
              if (Array.isArray(searchHistoryItems)) {
                for (const item of searchHistoryItems) {
                    checkHelpferFunctionResponse(item);
                    expect(item.name).toEqual(expected_history_items);
                }
              }
            }  
          }, 10000);
        });
    
        describe('getSearchHistoryItems for empty input', () => {
          it('should return empty array', async () => {
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
            const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);
            
            const emptySearchHistoryItems = await getSearchHistoryItems([], globalUserBodo);
            expect(emptySearchHistoryItems).toBeInstanceOf(Array);
            expect(emptySearchHistoryItems).toEqual([]);
          }, 10000);
        });

        describe('getSearchHistoryItems for empty search history', () => {
          it('should return empty array', async () => {
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
            const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);
            if (globalUserBodo)
              globalUserBodo.searchHistory = [] as unknown as [{ searchToken: string; date: Date; }];
            
            const emptySearchHistoryItems = await getSearchHistoryItems(itemsArray, globalUserBodo);
            expect(emptySearchHistoryItems).toBeInstanceOf(Array);
            expect(emptySearchHistoryItems).toEqual([]);
          }, 10000);
        });
    
        describe('filterItemsBySeason for valid input', () => {
          it('should return an array of objects, filtering for items that are out of season', async () => {
            
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
            
            const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);
    
            // ensure one item is in winter season and one in summer season
            itemsArray[0].categories = {HouseAndGarden: {name: 'HouseAndGarden', subcategories: [SummerSubcategories[1]]}}
            itemsArray[1].categories = {SportAndCamping: {name: 'SportAndCamping', subcategories: [WinterSubcategories[0]]}}
     
            const currentMonth = new Date().getMonth();
            const filterItemsBySeasonResponse = await filterItemsBySeason(itemsArray);
            
            if (filterItemsBySeasonResponse === null) {
              throw new Error('filterItemsBySeasonResponse is null');
            }
    
            // if current month is winter, no summer items should be returned
            if (currentMonth < 3 || currentMonth > 10) {
              for (const token of SummerSubcategories) {
                const summerItems = Array.isArray(filterItemsBySeasonResponse) ? filterItemsBySeasonResponse.filter((item: ItemInDBPopulated) => item.categories?.HouseAndGarden?.subcategories?.includes(token)) : [];
                expect(summerItems).toEqual([]);
              }
            } else {
              for (const token of WinterSubcategories) {
                const winterItems = Array.isArray(filterItemsBySeasonResponse) ? filterItemsBySeasonResponse.filter((item: ItemInDBPopulated) => item.categories?.HouseAndGarden?.subcategories?.includes(token)) : [];
                expect(winterItems).toEqual([]);
              }
            }
    
            if (Array.isArray(filterItemsBySeasonResponse)) {
                for (const item of filterItemsBySeasonResponse) {
                    checkHelpferFunctionResponse(item);
                }
            }
    
          }, 10000);
        });
    
        describe('filterItemsBySeason for empty input', () => {
          it('should return an empty array', async () => {
            const connectSidValue = await loginBodo4();
            const filterItemsBySeasonResponse = await filterItemsBySeason([]);
            expect(filterItemsBySeasonResponse).toEqual([]);
          });
        });
    
        describe('getItemsBasedonCatagory for valid input', () => {
          it('should return array of items, which only belong to the subcatagories of Sport and Garden', async () => {
    
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
    
            const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);

            if (globalUserBodo.searchHistory.length > 0){
              globalUserBodo.searchHistory = [] as unknown as [{ searchToken: string; date: Date; }];
            }
    
            globalUserBodo?.searchHistory.push({ searchToken: expected_catagory_items, date: getRandomDateIn1950() });
    
            // Account Fahrrad to the subcategory sport, 
            // because we expect that the returned array contains items from the subcategory Sport
            // because the user searched for Fahrrad, which is mostly account to the subcategory Sport
            let jd = 0;
            for (const item of itemsArray) {
              if (item.name === expected_catagory_items) {
                item.categories = { SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] } }
                if (jd === 0) 
                  // Also account Fahrrad to some ohter subcatagories, just to check if the function is working properly and returns only items from the subcategory Sport
                  // Because the Fahrrad is mostly account to the subcategory Sport, we expect that the returned array contains only items from the subcategory Sport
                  item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden'] }, SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] }}
                if (jd === 1) 
                  item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['House'] } }
                jd++;
              }
            }
    
            // Account Pfalnze to borrow history, so we can later check if the items in the returned array belong to the same subcategory as Pflanze
            globalUserBodo?.getHistory.push(new mongoose.Types.ObjectId(expected_catagory_item_id));
            const objectids = [ new mongoose.Types.ObjectId(expected_catagory_item_id)]
    
            // Account item to the subcategory garden
            // because the tested function should return items based on the most popular subcatagories of the search history and the borrow history
            jd = 0;
            for (const item of itemsArray) {
              for (const id of objectids) {
                if (item._id.toString() === id.toString()) {
                  item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden']}}
                  jd++;
                }
              }
    
              // Add some more items to the subcategory Sport and Garden
              // because we expect that the returned array contains items from the subcategory Sport and Garden
              if (jd > 4 && jd < 10) {
                // put all even items to the subcategory Sport
                if (jd % 2 === 0)
                  item.categories = { SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] } }
                // put all odd items to the subcategory Garden
                else
                  item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden'] } }
              }
              jd++;
            }
    
            const itemsBasedonCatagory = await getItemsBasedOnCatagories(itemsArray, globalUserBodo, 1);
    
            expect(itemsBasedonCatagory).toBeInstanceOf(Array);
            
            const arrayItemsBased: ItemInDBPopulated[] = Array.isArray(itemsBasedonCatagory) ? itemsBasedonCatagory : (itemsBasedonCatagory !== null ? [itemsBasedonCatagory] : []);
    
            // the returned items should only belong to the Sport or Garden Subcategory
            for (const item of arrayItemsBased) {
              // print subcategory of item
              const sport_sub = item.categories.SportAndCamping?.subcategories;
              const garden_sub = item.categories?.HouseAndGarden?.subcategories;
              if (sport_sub !== undefined) {
                expect(sport_sub).toEqual(expect.arrayContaining(['Sport']));
              }
              else
                expect(sport_sub).toBeUndefined();
              if (garden_sub !== undefined)
                expect(garden_sub).toEqual(expect.arrayContaining(['Garden']));
              else
                expect(garden_sub).toBeUndefined();
            }
          });
    
        describe('getItemsBasedonCatagory for empty input', () => {
            it('should return an empty array', async () => {
              const connectSidValue = await loginBodo4();
              const items = await getPopulatItems();
              const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);
              const emptyInputResponse = await getItemsBasedOnCatagories([], globalUserBodo, 2);
              expect(emptyInputResponse).toEqual([]);
            });
          }); 

        describe('getItemsBasedonCatagory for users whose search history is too short', () => {
          it('should return an empty array', async () => {
            const connectSidValue = await loginBodo4();
            const items = await getPopulatItems();
            const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);
            globalUserBodo.searchHistory = [] as unknown as [{ searchToken: string; date: Date; }];
            const emptyInputResponse = await getItemsBasedOnCatagories(itemsArray, globalUserBodo, 2);
            expect(emptyInputResponse).toEqual([]);
          });
        }); 

        });
    });
});

const getRandomDateIn1950 = (): Date => {
    const startOfYear = new Date('1950-01-01').getTime();
    const endOfYear = new Date('1950-12-31').getTime();
    const randomTime = startOfYear + Math.random() * (endOfYear - startOfYear);
    return new Date(randomTime);
};
