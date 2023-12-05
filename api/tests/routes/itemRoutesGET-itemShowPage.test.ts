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
  itemIdRoute,
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
    });
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    });
  });
};

const requestToInvalidId = (httpVerb: string, route: string) => {
  describe('when invalid itemId is given', () => {
    it('should respond error with a statusCode400 for not existing itemId', async () => {
      // id has correct pattern, but item doesnt exist
      const invalidItemIdOfCorrectPattern = '65673cc5811318fde3968147';

      // login bodo4
      const connectSidValue = await loginBodo4();

      // try route in question with wrong id
      const response = await (request(app) as any)
        [httpVerb](`${route}/${invalidItemIdOfCorrectPattern}`)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);

      // console.log('expect 400:', response.statusCode, response.text);
      // expect route in question to throw 400
      expect(response.statusCode).toBe(400);
      expect(response.text).toContain(
        'Error: Bad Request: This item does not exist',
      );

      // logout bodo4
      await logout(connectSidValue);
    });
    it('should respond error with a statusCode500 for itemId value that could not be cast to ObjectId', async () => {
      // login bodo4
      const connectSidValue = await loginBodo4();

      const invalidItemIdOfWrongPattern = '65673cc58318fde3968147';
      const invalidItemIdOfWrongPattern2 = 'hi';
      // TODO ER: I get a 500 for this one - what is happening here?
      // const invalidItemIdOfWrongPattern3 = '(ksd%=ks-.."9'; // URIError: Failed to decode param &#39;(ksd%=ks-..%229&#39;

      const invalidIDs = [
        invalidItemIdOfWrongPattern,
        invalidItemIdOfWrongPattern2,
        // invalidItemIdOfWrongPattern3,
      ];
      for (const invalidId of invalidIDs) {
        // try route in question with wrong id
        const response = await (request(app) as any)
          [httpVerb](`${route}/${invalidId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('expect 500:', response.statusCode, response.text);
        // expect route in question to throw 500
        expect(response.statusCode).toBe(500);
        expect(response.text).toContain(
          'CastError: Cast to ObjectId failed for value',
        );
      }

      // logout bodo4
      await logout(connectSidValue);
    });
  });
};

const checkResponseToBeCorrectlyProcessedItemForClient = ({
  validBody,
  ownerVariable,
  interactions,
  ownerData,
  commonCommunity,
}: {
  validBody: { item: ItemRequest };
  ownerVariable: boolean;
  interactions: string[] | null;
  ownerData: { test: string } | null;
  commonCommunity: {
    _id: string;
    picture: string;
    name: string;
  } | null;
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
    owner: ownerVariable,
    interactions: interactions,
    ownerData: ownerData,
    commonCommunity: commonCommunity,
  };

  return correctlyProcessedItemForClient;
};

// TESTS
describe('item Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`GET ${itemIdRoute} (showItem)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn('get', `${itemRoute}/65673cc5811318fde3968147`);

    describe('when valid itemId is given', () => {
      describe('should respond successful with a statusCode200 and processedItemData according to req.user', () => {
        // define getShowItemBody
        const getShowItemBody: { item: ItemRequest } = {
          item: {
            name: 'Item for testing GET (showItem) Route',
            categories: { Other: { subcategories: ['Sonstiges'] } },
          },
        };

        // define getShowItem Test for getShowItemBody:
        // login Bodo4, let him create an item, log bodo out,
        // login testUser, get showItem, logout testUser,
        // delete item with Bodo4
        // return [updatedItemResponse, deleteItemResponse]
        const getShowItemTest = async (
          testUserEmail: string,
          testUserPassword: string,
        ) => {
          //  login Bodo4
          const connectSidValueBodo4First = await loginBodo4();

          // for monitoring the test
          // // get users detail to extract myItems
          // const authResponse = await request(app)
          //   .get(authRoute)
          //   .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
          // // extract myItems array
          // console.log('myItems before getShowItem', authResponse.body.myItems);

          // create item to perform getShowItems on
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send(getShowItemBody)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
          // extract itemId
          const itemId = createItemResponse.body[0]._id;

          // for monitoring the test
          // // get users detail to extract myItems
          // const auth2Response = await request(app)
          //   .get(authRoute)
          //   .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
          // // extract myItems array
          // console.log('myItems after getShowItem', auth2Response.body.myItems);

          // logoutBodo
          await logout(connectSidValueBodo4First);

          //  login testUser
          const connectSidValueTestUser = await loginUser(
            testUserEmail,
            testUserPassword,
          );

          //getShowItem item in DB
          const getShowItemResponse = await request(app)
            .get(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValueTestUser}`]);

          // logout testUser
          await logout(connectSidValueTestUser);

          //  login Bodo4 again to delete item created for test
          const connectSidValueBodo4Second = await loginBodo4();

          // delete just created and getShowItemd item from DB
          const deleteItemResponse = await request(app)
            .delete(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

          // for monitoring the test
          // console.log(
          //   'getShowItem test item is again deleted:',
          //   deleteItemResponse.text,
          // );

          // // get users detail to extract myItems
          // const auth3Response = await request(app)
          //   .get(authRoute)
          //   .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
          // // extract myItems array
          // console.log('myItems after delete', auth3Response.body.myItems);

          // logout bodo
          await logout(connectSidValueBodo4First);

          return [getShowItemResponse, deleteItemResponse];
        };

        it('for user is owner', async () => {
          // login Bodo4, let him create an item, log bodo out, login testUser, get showItem, logout testUser, delete item with Bodo4 - return [updatedItemResponse, deleteItemResponse]
          const getShowItemTestResponse = await getShowItemTest(
            'bodo4@gmail.com',
            'bodo4',
          );

          // responses from updateTest
          const getShowItemResponse = getShowItemTestResponse[0];
          // console.log('getShowItemResponse.body', getShowItemResponse.body);
          const deleteItemResponse = getShowItemTestResponse[1];
          // console.log('deleteItemResponse.text', deleteItemResponse.text);

          // expects
          // for get showItem
          expect(getShowItemResponse.statusCode).toBe(200);

          // expect the body array to only have one object inside
          expect(getShowItemResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from getShowItemBody with the owner settings from processed item
          const getShowItem = getShowItemResponse.body[0];
          expect(getShowItem).toEqual(
            checkResponseToBeCorrectlyProcessedItemForClient({
              validBody: getShowItemBody,
              ownerVariable: true,
              interactions: [],
              ownerData: null,
              commonCommunity: null,
            }),
          );

          // expect
          // for successfully deleting updated item
          expect(deleteItemResponse.text).toBe(
            `Successfully deleted item ${getShowItem._id}!`,
          );
        });
        describe('for user is not owner', () => {
          it('and is not involved in an interaction user', async () => {
            // login Bodo4, let him create an item, log bodo out, login testUser, get showItem, logout testUser, delete item with Bodo4 - return [updatedItemResponse, deleteItemResponse]
            const getShowItemTestResponse = await getShowItemTest(
              'bibi@gmail.com',
              'bibi',
            );

            // responses from updateTest
            const getShowItemResponse = getShowItemTestResponse[0];
            // console.log('getShowItemResponse.body', getShowItemResponse.body);
            const deleteItemResponse = getShowItemTestResponse[1];
            // console.log('deleteItemResponse.text', deleteItemResponse.text);

            // expects
            // for item creation
            expect(getShowItemResponse.statusCode).toBe(200);

            // expect the body array to only have one object inside
            expect(getShowItemResponse.body).toHaveLength(1);

            // expect the body[0] to resemble the data inputs from getShowItemBody with the not in an interaction involved user
            const getShowItem = getShowItemResponse.body[0];
            expect(getShowItem).toEqual(
              checkResponseToBeCorrectlyProcessedItemForClient({
                validBody: getShowItemBody,
                ownerVariable: false,
                interactions: null,
                ownerData: null,
                commonCommunity: {
                  _id: '6544be0f04b3ecd121538985',
                  picture:
                    'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
                  name: 'our common community',
                },
              }),
            );

            // expect
            // for successfully deleting updated item
            expect(deleteItemResponse.text).toBe(
              `Successfully deleted item ${getShowItem._id}!`,
            );
          });

          // it('and was previously involved in an interaction', async () => {
          //   //
          // });

          // it('and is currently involved in the interaction', async () => {
          //   //
          // });
        });
      });
    });

    // check invalid ItemIds
    requestToInvalidId('get', itemRoute); // can only pass itemRoute and not item/:itemId because itemId is created in function
  });
});
