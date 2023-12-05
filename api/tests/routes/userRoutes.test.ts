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
  userIdMyItemsRoute,
  userRoute,
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

const notPassedIsUser = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when isUser was not passed', () => {
    it('should respond error with a statusCode403 if req.user is not :userId', async () => {
      // situation: bodo4 tries to access bibis inventory

      const bibisUserId = '6544bd1bdf354e46068d74bf';

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
    });
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
    });
  });
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
      `${userRoute}/65673cc5811318fde3968147/inventory/myItems`,
    );

    notPassedIsUser(
      'get',
      userRoute,
      userIdMyItemsRoute.split(':userId/').slice(-1)[0],
    );

    // describe('when isLoggedIn was passed', () => {
    //   it('should respond successful with a statusCode200 and processedItemData for user with items', async () => {
    //     //
    //   });
    //   it('should respond successful with a statusCode200 and empty array for user with NO items', async () => {
    //     //
    //   });
    // });
  });

  // describe('POST /user/:userId/changePassword', () => {
  //   // reset password after every test
  //   describe('when isLoggedIn was not passed', () => {
  //     it('should respond error with a statusCode401 if req.user undefined', async () => {
  //       //
  //     });
  //     it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
  //       //
  //     });
  //   });
  //   describe('when isUser was not passed', () => {
  //     it('should respond error with a statusCode403 if req.user is not :userId', async () => {
  //       //
  //     });
  //   });
  //   // define valid input
  //   describe('when changePassword body is given', () => {
  //     it('should respond successful with a statusCode200 and user data for valid old and new password', async () => {
  //       //
  //     });
  //     it('should respond error with a statusCode400 for old and new passwords being equal', async () => {
  //       // change input to equal pws
  //     });
  //     it('should respond error with a statusCode400 for only old or new password given', async () => {
  //       // change input to a) only old given, b) only new given
  //     });
  // it('should respond error with a statusCode400 for invalid field(s)', async () => {
  //   // add field(s) to inout
  // });
  //     it('should respond error with a statusCode500 for old password being incorrect', async () => {
  //       // change input to having wrong old password
  //     });
  //   });
  //   describe('when changePassword body is NOT given', () => {
  //     it('should respond error with a statusCode400 for empty body', async () => {
  //       // change input to empty
  //     });
  //   });
  // });

  // describe('PUT /user/:userId/settings', () => {
  //   describe('when isLoggedIn was not passed', () => {
  //     it('should respond error with a statusCode401 if req.user undefined', async () => {
  //       //
  //     });
  //     it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
  //       //
  //     });
  //   });
  //   describe('when isUser was not passed', () => {
  //     it('should respond error with a statusCode403 if req.user is not :userId', async () => {
  //       //
  //     });
  //   });
  //   // define valid input
  //   describe('when newUserData body is given', () => {
  //     it('should respond successful with a statusCode200 and user data for input including a newUserData Object', async () => {
  //       //
  //     });
  //     it('should respond successful with a statusCode200 and user data for input including any of the optional newUserData fields firstName, lastName, phone, adress', async () => {
  //       // change input to include any only one and some combinations
  //     });
  //     it('should respond error with a statusCode400 for invalid field(s)', async () => {
  //       // add field(s) to input
  //     });
  //   });
  //   describe('when newUserData body is NOT given', () => {
  //     it('should respond error with a statusCode400 for empty body', async () => {
  //       // change input to empty
  //     });
  //   });
  // });

  // describe('xxx', () => {
  //   describe('when xxx given', () => {
  //   it('should respond successful with a statusCode200 and xxx for xxx', async () => {
  //   //
  //   });
  //   it('should respond error with a statusCodexxx and xxx for xxx', async () => {
  //     //
  //     });
  //   });
});

console.log('all tests in userRoutes.test.ts ran');
