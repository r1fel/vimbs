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
export const loginBodo4 = async () => {
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

export const loginUser = async (email: string, password: string) => {
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

export const logout = async (connectSidValue: string) => {
  await request(app)
    .post(logoutRoute)
    .set('Cookie', [`connect.sid=${connectSidValue}`]);
};

// pass in the route which is protected by the isLoggedIn middleware
// test, that middleware is doing it's route protecting properly
export const notPassedIsLoggedIn = (httpVerb: string, route: string) => {
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

export const notPassedIsOwner = (httpVerb: string, route: string) => {
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

        // console.log('expect 403:', response.statusCode, response.text);
        // expect route in question to throw 403
        expect(response.statusCode).toBe(403);
        expect(response.text).toContain(
          'Error: Forbidden: You do not have permission to do that!',
        );

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
  });
};

// TESTS
describe('item Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`DELETE ${itemIdRoute} (deleteItem)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn('delete', `${itemRoute}/65673cc5811318fde3968147`);

    notPassedIsOwner('delete', itemRoute); // can only pass itemRoute and not item/:itemId because itemId is created in function

    describe('when existing itemId is given', () => {
      it('should respond successful with a statusCode200 if user is the item.owner', async () => {
        // login bodo4
        const connectSidValue = await loginBodo4();
        // create item as bodo4
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing DELETE Route',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // delete item
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // expect
        expect(deleteItemResponse.statusCode).toBe(200);
        expect(deleteItemResponse.text).toBe(
          `Successfully deleted item ${itemId}!`,
        );

        // logout bodo4
        await logout(connectSidValue);
      });

      // it('should delete item from DB', async () => {
      //   // call show item and get not found error
      // });

      it('should pull item from owner.myItems', async () => {
        // login bodo4
        const connectSidValue = await loginBodo4();
        // create item as bodo4
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing DELETE Route',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // get users detail to extract myItems
        const authResponse = await request(app)
          .get(authRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract myItems array
        const bodosMyItemsBeforeDeletion = authResponse.body.myItems;

        // delete item
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // get users detail to extract myItems after deletion ran in last test
        const auth2Response = await request(app)
          .get(authRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract myItems array
        const bodosMyItemsAfterDeletion = auth2Response.body.myItems;

        expect(itemId).toBe(
          bodosMyItemsBeforeDeletion[bodosMyItemsBeforeDeletion.length - 1],
        );
        expect(bodosMyItemsAfterDeletion).not.toContain(itemId);
        expect(
          bodosMyItemsBeforeDeletion[bodosMyItemsBeforeDeletion.length - 2],
        ).toBe(bodosMyItemsAfterDeletion[bodosMyItemsAfterDeletion.length - 1]);
        // expect(ExpressError).not.toHaveBeenCalled;

        // logout bodo4
        await logout(connectSidValue);
      });

      // TODO ER: i would have to look inside the delete request and check the req.body there
      // it('should set req.body to {} even for sent in data', async () => {
      //   // login bodo4
      //   const connectSidValue = await loginBodo4();
      //   // create item as bodo4
      //   const createItemResponse = await request(app)
      //     .post(itemRoute)
      //     .send({
      //       item: {
      //         name: 'Item for testing DELETE Route',
      //         categories: { Other: { subcategories: ['Sonstiges'] } },
      //       },
      //     })
      //     .set('Cookie', [`connect.sid=${connectSidValue}`]);
      //   // extract itemId
      //   const itemId = createItemResponse.body[0]._id;

      //   // delete item
      //   const deleteItemResponse = await request(app)
      //     .delete(`${itemRoute}/${itemId}`)
      //     .send({ some: 'body, that is not supposed to be here' })
      //     .set('Cookie', [`connect.sid=${connectSidValue}`]);

      //   // expect
      // });
      // TODO ER: it should in the future set a bool of deleted to true on item, so that it can be shown for users having item in watchlist etc
    });
  });
});

console.log('all tests in itemRoutesDELETE-deleteItem.test.ts ran');
