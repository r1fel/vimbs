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
import { boolean } from 'joi';
import e from 'express';

const app = makeApp(database);

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


describe('item Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  // TODO check item funktion
  // TODO: test is missing a user for whom no items are available
  describe(`GET ${itemRoute} (index)`, () => {
    notPassedIsLoggedIn('post', itemRoute);
    describe('when items are availabe for user', () => {
      it('should respond successful with a statusCode200 and return available items for user', async () => {
        const connectSidValue = await loginBodo4();
        const index_response = await request(app)
          .get('/item')
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
    
        //expect success status code
        expect(index_response.status).toBe(200);
        //expect response body to be an array
        expect(index_response.body).toBeInstanceOf(Array);
  
        //expect response body to contain items
        const responseItems = index_response.body;
        expect(responseItems.length).toBeGreaterThan(0);
        for (const item of responseItems) {
          expect(item).toEqual({
          _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          available: expect.any(Boolean),
          picture: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          categories: expect.any(Object),
          dueDate: null,
          owner: false,
          interactions: item.interactions === null ?
          null :
          expect.any(Array),
          commonCommunity: expect.any(Object),
          ownerData: expect.any(Object),
          });
        }
        await logout(connectSidValue);
      }, 10000);
    });
  });

  // TODO check item funktion
  describe(`GET ${itemSearchRoute} (itemSearch)`, () => {
    notPassedIsLoggedIn('post', itemRoute);
    describe('for itemSearch', () => {
      it('should respond successful with a statusCode200 and return list of available item names', async () => {

        const connectSidValue = await loginBodo4();
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
        }
      await logout(connectSidValue);
    }, 10000);
    });
  });

  //TODO den valid response body test integrieren
  describe(`GET ${itemSuggestRoute} (suggestItems)`, () => {

    notPassedIsLoggedIn('post', itemRoute);
    notPassedIsOwner('put', itemRoute);
    
    // Test individual helper functions
    describe('getRandomItems for valid input', () => {
      it('should return an array of random selected items', async () => {
        const connectSidValue = await loginBodo4();
        const items = await getPopulatItems('6553b5bfa70b16a991b89001');
        const random_items = await getRandomItems(items, 3);
        expect(random_items).toBeInstanceOf(Array)
        await logout(connectSidValue);
      }, 10000);
    });

    describe('getRandomItems for invalid input', () => {
      it('should return an empty array', async () => {
        const connectSidValue = await loginBodo4();
        const random_items = await getRandomItems([], 3);
        expect(random_items).toBeInstanceOf(Array)
        await logout(connectSidValue);
      }, 10000);
    });

    //TODO den valid response body test integrieren
    describe('getMostBorrowedItems for valid input', () => {
      it('should return an array of items with most interactions in descending order', async () => {
        
        const connectSidValue = await loginBodo4();
        const items = await getPopulatItems('6544bd1bdf354e46068d74bf');

        let itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items.filter(item => item !== null) as ItemInDBPopulated[] : [items].filter(item => item !== null) as ItemInDBPopulated[];
        for (let i = 0; i < itemsArray.length && i < 5; i++) {
          itemsArray[i].interactions = new Array(i + 1).fill(itemId);
        }

        const mostBorrowedItems = await getMostBorrowedItems(itemsArray, 6);
        expect(mostBorrowedItems).toBeInstanceOf(Array);
        await logout(connectSidValue);
      }, 10000);
    });

    describe('getMostBorrowedItems for invalid input', () => {
      it('should return an empty array', async () => {
        const connectSidValue = await loginBodo4();
        const mostBorrowedItems = await getMostBorrowedItems([], 6);
        expect(mostBorrowedItems).toBeInstanceOf(Array);
        expect(mostBorrowedItems).toEqual([]);
        await logout(connectSidValue);
      }, 10000);
    });

    describe('getSearchHistoryItems for valid input', () => {
      it('should return array of objects', async () => {
        const connectSidValue = await loginBodo4();
        const items = await getPopulatItems('6544bd1bdf354e46068d74bf');

        const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);

        globalUserBodo?.searchHistory.push({ searchToken: 'Fahrrad', date: getRandomDateIn1950() });
        const searchHistoryItems = await getSearchHistoryItems(itemsArray, globalUserBodo);
        expect(searchHistoryItems).toBeInstanceOf(Array);
      }, 10000);
    });

    describe('getSearchHistoryItems for invalid input', () => {
      it('should return empty array', async () => {
        const connectSidValue = await loginBodo4();
        const items = await getPopulatItems('6544bd1bdf354e46068d74bf');
        const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);
        if (globalUserBodo)
          globalUserBodo.searchHistory = [] as unknown as [{ searchToken: string; date: Date; }];
        
        const emptySearchHistoryItems = await getSearchHistoryItems(itemsArray, globalUserBodo);
        expect(emptySearchHistoryItems).toBeInstanceOf(Array);
        expect(emptySearchHistoryItems).toEqual([]);
        
        const emptyInput= await getSearchHistoryItems(itemsArray, globalUserBodo);
        expect(emptyInput).toBeInstanceOf(Array);
        expect(emptyInput).toEqual([]);
      }, 10000);
    });

    describe('filterItemsBySeason for valid input', () => {
      it('should return array of objects', async () => {
        
        const connectSidValue = await loginBodo4();
        const items = await getPopulatItems('6544bd1bdf354e46068d74bf');
        
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

        const item = Array.isArray(filterItemsBySeasonResponse) ? filterItemsBySeasonResponse[0] : filterItemsBySeasonResponse;
        expect(item._id).toEqual(expect.any(Object));
        expect(item.picture).toEqual(expect.any(String));
        expect(item.name).toEqual(expect.any(String));
        expect(item.description).toEqual(expect.any(String));
        expect(item.categories).toEqual(expect.any(Object));
        expect(item.owner).toEqual(expect.any(Object));
        expect(item.interactions).toEqual(expect.any(Array));
        expect(item.available).toEqual(expect.any(Boolean));

      }, 10000);
    });

    describe('filterItemsBySeason for invalid input', () => {
      it('should return empty array', async () => {
        const connectSidValue = await loginBodo4();
        const filterItemsBySeasonResponse = await filterItemsBySeason([]);
        expect(filterItemsBySeasonResponse).toEqual([]);
      });
    });

    describe('getItemsBasedonCatagory for valid input', () => {
      it('should return array of item, which only belong to the subcatagories of Sport and Garden', async () => {

        const connectSidValue = await loginBodo4();
        const items = await getPopulatItems('6544bd1bdf354e46068d74bf');

        const itemsArray: ItemInDBPopulated[] = Array.isArray(items) ? items : (items !== null ? [items] : []);

        globalUserBodo?.searchHistory.push({ searchToken: 'Fahrrad', date: getRandomDateIn1950() });
        globalUserBodo?.searchHistory.push({ searchToken: 'Fahrrad', date: getRandomDateIn1950() });
        globalUserBodo?.searchHistory.push({ searchToken: 'Fahrrad', date: getRandomDateIn1950() });
        globalUserBodo?.searchHistory.push({ searchToken: 'Fahrrad', date: getRandomDateIn1950() });
        globalUserBodo?.searchHistory.push({ searchToken: 'Fahrrad', date: getRandomDateIn1950() });

        // Account Fahrrad to the subcatagory sport, so we can later check if the item is in the returned array belong to the same subcatagory
        let jd = 0;
        for (const item of itemsArray) {
          if (item.name === 'Fahrrad') {
            item.categories = { SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] } }
            if (jd === 0) 
              item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden'] }, SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] }}
            if (jd === 1) 
              item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['House'] } }
            jd++;
          }
        }

        // Account Pfalnze to search history, so we can later check if the item is in the returned array belong to the same subcatagory as Pflanze
        globalUserBodo?.getHistory.push(new mongoose.Types.ObjectId("6553bc9a22932b85d2937a53"));
        globalUserBodo?.getHistory.push(new mongoose.Types.ObjectId("6553bc9a22932b85d2937a59"));
        globalUserBodo?.getHistory.push(new mongoose.Types.ObjectId("6553bc9b22932b85d2937a73"));

        const objectids = [ new mongoose.Types.ObjectId("6553bc9a22932b85d2937a53"), 
                            new mongoose.Types.ObjectId("6553bc9a22932b85d2937a59"), 
                            new mongoose.Types.ObjectId("6553bc9b22932b85d2937a73")]

        // Account Pfalnze to the subcatagory garden
        jd = 0;
        for (const item of itemsArray) {
          for (const id of objectids) {
            if (item._id.toString() === id.toString()) {
              item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden'] } }
              if (jd === 0) 
                item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden'] }, SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] }}
              if (jd === 1) 
                item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['House'] } }
              jd++;
            }
          }

          // Add more items to the two subcatagory. We expect some of these items to be returned in the array
          if (item._id.toString() === '6553bc9a22932b85d2937a55')
            item.categories = { SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] } }
          if (item._id.toString() === '6553bc9b22932b85d2937a6f')
            item.categories = { SportAndCamping: { name: 'SportAndCamping', subcategories: ['Sport'] } }
          if (item._id.toString() === '6553bc9b22932b85d2937a77')
            item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden'] } }
          if (item._id.toString() === '6553bc9a22932b85d2937a5f')
            item.categories = { HouseAndGarden: { name: 'HouseAndGarden', subcategories: ['Garden'] } }
        }

        const itemsBasedonCatagory = await getItemsBasedOnCatagories(itemsArray, globalUserBodo, 2);

        expect(itemsBasedonCatagory).toBeInstanceOf(Array);
        
        const arrayItemsBased: ItemInDBPopulated[] = Array.isArray(itemsBasedonCatagory) ? itemsBasedonCatagory : (itemsBasedonCatagory !== null ? [itemsBasedonCatagory] : []);

        // the returned items should only belong to the Sport or Garden Subcatagory
        for (const item of arrayItemsBased) {
          // print subcatagory of item
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

      // TODO user hat net genug search history oder borrow history leer, leere items leer
      /* describe('getItemsBasedonCatagory for invalid input', () => {
        it('should return array of item, which only belong to the subcatagories of Sport and Garden', async () => {
  
          const connectSidValue = await loginBodo4();
          const items = await getPopulatItems('6544bd1bdf354e46068d74bf');
        }); */
    }); 
  });  
});

const getRandomDateIn1950 = (): Date => {
  const startOfYear = new Date('1950-01-01').getTime();
  const endOfYear = new Date('1950-12-31').getTime();
  const randomTime = startOfYear + Math.random() * (endOfYear - startOfYear);
  return new Date(randomTime);
};
  

//TODO: test for getItemsBasedonCatagory
