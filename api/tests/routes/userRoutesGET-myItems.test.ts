import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import { ItemRequest } from '../../src/typeDefinitions';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  authRoute,
  itemRoute,
  userIdMyItemsRoute,
  userRoute,
  bodo4sUserId,
  bibisUserId,
} from './utilsForRoutes';

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

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    }, 10000);
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    }, 10000);
  });
};

const notPassedIsUser = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when isUser was not passed', () => {
    it('should respond error with a statusCode403 if req.user is not :userId', async () => {
      // situation: bodo4 tries to access bibis inventory
      //  login Bodo4
      const connectSidValue = await loginBodo4();

      const response = await (request(app) as any)
        [httpVerb](`${routeBase}/${bibisUserId}/${routeEnd}`)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);

      // console.log('Test IsUser: expect 403:', response.statusCode, response.text);

      // logoutBodo
      await logout(connectSidValue);

      expect(response.statusCode).toBe(403);
      expect(response.text).toContain(
        'Forbidden: You are not allowed to view this content!',
      );
    }, 10000);
    it('should respond error with a statusCode500 for userId value that is no ObjectId', async () => {
      // login bodo4
      const connectSidValue = await loginBodo4();

      const invalidItemIdOfWrongPattern = '65673cc58318fde3968147';
      const invalidItemIdOfWrongPattern2 = 'hi';
      // TODO ER: I get a 400 for this one - what is happening here?
      // const invalidItemIdOfWrongPattern3 = '(ksd%=ks-.."9'; // URIError: Failed to decode param &#39;(ksd%=ks-..%229&#39;

      const invalidIDs = [
        invalidItemIdOfWrongPattern,
        invalidItemIdOfWrongPattern2,
        // invalidItemIdOfWrongPattern3,
      ];
      for (const invalidId of invalidIDs) {
        // try route in question with wrong id
        const response = await (request(app) as any)
          [httpVerb](`${routeBase}/${invalidId}/${routeEnd}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('expect 500:', response.statusCode, response.text);

        // expect route in question to throw 500
        expect(response.statusCode).toBe(500);
        expect(response.text).toContain(
          'BSONError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer',
        );
      }

      // logout bodo4
      await logout(connectSidValue);
    }, 10000);
  });
};

const checkResponseToBeCorrectlyProcessedItemForClient = (validBody: {
  item: ItemRequest;
}) => {
  const correctlyProcessedItemForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: validBody.item.name,
    available: true,
    picture: validBody.item.picture || null,
    description: validBody.item.description || null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories:
          validBody.item.categories.AdultClothing?.subcategories ?? [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories:
          validBody.item.categories.ChildAndBaby?.subcategories ?? [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories:
          validBody.item.categories.HouseAndGarden?.subcategories ?? [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories:
          validBody.item.categories.MediaAndGames?.subcategories ?? [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: validBody.item.categories.Other?.subcategories ?? [],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories:
          validBody.item.categories.SportAndCamping?.subcategories ?? [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories:
          validBody.item.categories.Technology?.subcategories ?? [],
      },
    },
    dueDate: null,
    owner: true,
    interactions: [],
    ownerData: null,
    commonCommunity: null,
  };

  return correctlyProcessedItemForClient;
};

// TESTS
describe('user Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`GET ${userIdMyItemsRoute}`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn(
      'get',
      `${userRoute}/65673cc5811318fde3968147/${
        userIdMyItemsRoute.split(':userId/').slice(-1)[0]
      }`,
    );

    // check if isUser throws appropriate errors
    notPassedIsUser(
      'get',
      userRoute,
      userIdMyItemsRoute.split(':userId/').slice(-1)[0],
    );

    describe('when controller ran', () => {
      // TODO ER: these tests are weirdly buggy, sometimes not giving the right amount of created items
      it('should respond successful with a statusCode200 and empty array if user has no items', async () => {
        // login bodo, delete all of his items, run auth for bodos id, run user myInventory, logout bodo
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // delete all of Bodo4s Items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // get bodos empty inventory
        const myInventoryResponse = await request(app)
          .get(
            `${userRoute}/${bodo4sUserId}/${
              userIdMyItemsRoute.split(':userId/').slice(-1)[0]
            }`,
          )
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout
        await logout(connectSidValue);

        expect(myInventoryResponse.statusCode).toBe(200);

        // expect the body array to be empty
        expect(myInventoryResponse.body).toHaveLength(0);
      }, 10000);

      it('should respond successful with a statusCode200 and processedItemData for user with one item', async () => {
        // define create body
        const inventoryTestBody: { item: ItemRequest } = {
          item: {
            name: 'Item from Inventory Test with one item in myItems',
            categories: { Other: { subcategories: ['Sonstiges'] } },
          },
        };

        // login bodo, delete all of his items, create an item, run user myInventory, delete item, logout bodo

        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // delete all of Bodo4s Items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        //create item in DB
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send(inventoryTestBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // get bodos empty inventory
        const myInventoryResponse = await request(app)
          .get(
            `${userRoute}/${bodo4sUserId}/${
              userIdMyItemsRoute.split(':userId/').slice(-1)[0]
            }`,
          )
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // delete all of Bodo4s Items
        const deleteAllOfUsersItemsResponse2 = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout
        await logout(connectSidValue);

        // expects
        expect(myInventoryResponse.statusCode).toBe(200);

        // expect the body array to only have one object inside
        expect(myInventoryResponse.body).toHaveLength(1);

        // expect the body[0] to resemble the data inputs from getShowItemBody with the owner settings from processed item
        const InventoryItem = myInventoryResponse.body[0];
        expect(InventoryItem).toEqual(
          checkResponseToBeCorrectlyProcessedItemForClient(inventoryTestBody),
        );
      });

      it('should respond successful with a statusCode200 and processedItemData for user with several items', async () => {
        // define create body
        const inventoryTestBody: { item: ItemRequest } = {
          item: {
            name: 'Item from Inventory Test with several items in myItems',
            categories: { Other: { subcategories: ['Sonstiges'] } },
          },
        };

        // login bodo, delete all of his items, create 3 item, run user myInventory, delete items, logout bodo

        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // delete all of Bodo4s Items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        //create items in DB
        const createItemResponse1 = await request(app)
          .post(itemRoute)
          .send(inventoryTestBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        const createItemResponse2 = await request(app)
          .post(itemRoute)
          .send(inventoryTestBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        const createItemResponse3 = await request(app)
          .post(itemRoute)
          .send(inventoryTestBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // get bodos empty inventory
        const myInventoryResponse = await request(app)
          .get(
            `${userRoute}/${bodo4sUserId}/${
              userIdMyItemsRoute.split(':userId/').slice(-1)[0]
            }`,
          )
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // get users detail to compare items array with recived response
        const authResponse = await request(app)
          .get(authRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // delete all of Bodo4s Items
        const deleteAllOfUsersItemsResponse2 = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout
        await logout(connectSidValue);

        // expects
        expect(myInventoryResponse.statusCode).toBe(200);

        // expect the body array to only have one object inside
        expect(myInventoryResponse.body).toHaveLength(3);

        // expect the body[0] to resemble the data inputs from getShowItemBody with the owner settings from processed item
        const InventoryItem1 = myInventoryResponse.body[0];
        expect(InventoryItem1).toEqual(
          checkResponseToBeCorrectlyProcessedItemForClient(inventoryTestBody),
        );
        // expect the body[0] to resemble the data inputs from getShowItemBody with the owner settings from processed item
        const InventoryItem2 = myInventoryResponse.body[1];
        expect(InventoryItem2).toEqual(
          checkResponseToBeCorrectlyProcessedItemForClient(inventoryTestBody),
        );
        // expect the body[0] to resemble the data inputs from getShowItemBody with the owner settings from processed item
        const InventoryItem3 = myInventoryResponse.body[2];
        expect(InventoryItem3).toEqual(
          checkResponseToBeCorrectlyProcessedItemForClient(inventoryTestBody),
        );

        const inventoryItemsArray = [
          myInventoryResponse.body[0]._id,
          myInventoryResponse.body[1]._id,
          myInventoryResponse.body[2]._id,
        ];
        expect(authResponse.body.myItems).toEqual(inventoryItemsArray);
      });
    });
  });

  describe('DELETE all items', () => {
    it('should delete all of bodo4s items', async () => {
      // login bodo4
      const connectSidValue = await loginBodo4();
      // create item as bodo4
      const deleteAllOfUsersItemsResponse = await request(app)
        .delete(itemRoute)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);
      // logout bodo4
      await logout(connectSidValue);

      expect([
        'You had no items to delete.',
        'Successfully deleted all of your items!',
      ]).toEqual(expect.arrayContaining([deleteAllOfUsersItemsResponse.text]));

      console.log('all tests in userRoutes.test.ts ran');
    }, 10000);
  });
});
