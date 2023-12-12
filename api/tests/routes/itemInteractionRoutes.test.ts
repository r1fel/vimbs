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
  itemIdInteractionRoute,
  itemIdToggleAvailabilityRoute,
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
    }, 10000);
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    }),
      10000;
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

const notPassedIsItemAvailable = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when isItemAvailable was not passed', () => {
    it('should respond error with a statusCode400 if item is currently not available', async () => {
      // login bodo4, create an item, get itemId, set item to not available, do request of interest, delete item, logout bodo4
      // login bodo4
      const connectSidValue = await loginBodo4();

      // create item
      const createItemResponse = await request(app)
        .post(itemRoute)
        .send({
          item: {
            name: 'Item for testing isItemAvailable',
            categories: { Other: { subcategories: ['Sonstiges'] } },
          },
        })
        .set('Cookie', [`connect.sid=${connectSidValue}`]);
      // extract itemId
      const itemId = createItemResponse.body[0]._id;

      //  set item to not available so that isItemAvailable throws the expected error
      const toggleAvailablityResponse = await request(app)
        .get(
          `${itemRoute}/${itemId}/${
            itemIdToggleAvailabilityRoute.split(':itemId/').slice(-1)[0]
          }`,
        )
        .set('Cookie', [`connect.sid=${connectSidValue}`]);

      // test route of interest on just created and not available item
      const createItemInteractionResponse = await (request(app) as any)
        [httpVerb](`${routeBase}/${itemId}/${routeEnd}`)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);

      // delete all items
      const deleteAllOfUsersItemsResponse = await request(app)
        .delete(itemRoute)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);

      // logout bodo4
      await logout(connectSidValue);

      // console.log('expect 400:', createItemInteractionResponse.statusCode, createItemInteractionResponse.text);
      // expect route in question to throw 400
      expect(createItemInteractionResponse.statusCode).toBe(400);
      expect(createItemInteractionResponse.text).toContain(
        'Error: Bad Request: This item is currently not available',
      );
    }, 10000);
  });

  describe('when invalid itemId is given', () => {
    it('should respond error with a statusCode400 for not existing itemId', async () => {
      // id has correct pattern, but item doesnt exist
      const invalidItemIdOfCorrectPattern = '65673cc5811318fde3968147';

      // login bodo4
      const connectSidValue = await loginBodo4();

      // try route in question with wrong id
      const response = await (request(app) as any)
        [httpVerb](`${routeBase}/${invalidItemIdOfCorrectPattern}/${routeEnd}`)
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
          [httpVerb](`${routeBase}/${invalidId}/${routeEnd}`)
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

const notPassedIsNotOwner = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when isNotOwner was not passed', () => {
    describe('when valid itemId is given', () => {
      it('should respond error with a statusCode403 if user is the item.owner', async () => {
        // login bodo4, create an item, get itemId, set item to not available, do request of interest, delete item, logout bodo4
        // login bodo4
        const connectSidValue = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing isNotOwner',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // test route of interest on just created and not available item
        const createItemInteractionResponse = await (request(app) as any)
          [httpVerb](`${routeBase}/${itemId}/${routeEnd}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout bodo4
        await logout(connectSidValue);

        // console.log('expect 403:', createItemInteractionResponse.statusCode, createItemInteractionResponse.text );
        // expect route in question to throw 403
        expect(createItemInteractionResponse.statusCode).toBe(403);
        expect(createItemInteractionResponse.text).toContain(
          'Error: Forbidden: You do not have permission to do that!',
        );
      }, 10000);
    });
  });
};

// TESTS
describe('itemInteraction Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`POST ${itemIdInteractionRoute} (open interaction)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn(
      'post',
      `${itemRoute}/65673cc5811318fde3968147/${
        itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
      }`,
    );

    notPassedIsItemAvailable(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    );

    notPassedIsNotOwner(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    );

    describe('when valid itemInteraction body is given', () => {
      // it('xxx', async () => {
      //   await testForValidBody(validBody5);
      // });
    });

    describe('when invalid itemInteraction body is given', () => {
      // it('xxx', async () => {
      //    await testForInvalidBody(validBody5);
      // });
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
        ]).toEqual(
          expect.arrayContaining([deleteAllOfUsersItemsResponse.text]),
        );

        console.log(
          'all tests in itemInteractionRoutesPOST-openInteraction.test.ts ran',
        );
      }, 10000);
    });
  });
});

describe('dummy', () => {
  describe('when dummytest given', () => {
    it('should be happy ', async () => {
      expect(true).toBe(true);
    });
  });
});

// describe('xxx', () => {
//   describe('when xxx given', () => {
//   it('should respond successful with a statusCode200 and xxx for xxx', async () => {
//   //
//   });
//   it('should respond error with a statusCodexxx and xxx for xxx', async () => {
//     //
//     });
//   });
// });
