import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';

// type Definintions
import { ItemRequest, ChangeSettingsRequest } from '../../src/typeDefinitions';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  userIdChangePasswordRoute,
  userRoute,
  bodosUserId,
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

// TESTS
describe('user Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`POST ${userIdChangePasswordRoute}`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn(
      'post',
      `${userRoute}/65673cc5811318fde3968147/${
        userIdChangePasswordRoute.split(':userId/').slice(-1)[0]
      }`,
    );

    // check if isUser throws appropriate errors
    notPassedIsUser(
      'post',
      userRoute,
      userIdChangePasswordRoute.split(':userId/').slice(-1)[0],
    );

    describe('when valid changePassword body is given', () => {
      it('should respond successful with a statusCode200 and response text for valid old and new password', async () => {
        // login bodo4, change password, change password back, logout bodo4

        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // change password
        const changePasswordResponse = await request(app)
          .post(
            `${userRoute}/${bodosUserId}/${
              userIdChangePasswordRoute.split(':userId/').slice(-1)[0]
            }`,
          )
          .send({
            oldPassword: 'bodo4',
            newPassword: 'bodo44',
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // change password back
        const changePasswordBackResponse = await request(app)
          .post(
            `${userRoute}/${bodosUserId}/${
              userIdChangePasswordRoute.split(':userId/').slice(-1)[0]
            }`,
          )
          .send({
            oldPassword: 'bodo44',
            newPassword: 'bodo4',
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout
        await logout(connectSidValue);

        // expects
        expect(changePasswordResponse.statusCode).toBe(200);
        expect(changePasswordResponse.text).toBe(
          'successfully changed password',
        );

        // successful change PW back
        expect(changePasswordBackResponse.statusCode).toBe(200);
        expect(changePasswordBackResponse.text).toBe(
          'successfully changed password',
        );
      });
    });
    describe('when invalid changePassword body is given', () => {
      // expect statements for all tests in this block
      const expectsForInvalidPasswordBody = (
        statusCode: number,
        invalidity: string,
        changePasswordResponse: request.Response,
      ) => {
        // console.log(changePasswordResponse.statusCode, changePasswordResponse.error);

        // expects
        expect(changePasswordResponse.statusCode).toBe(statusCode);
        expect(changePasswordResponse.text).toContain(invalidity);

        // log for checking that all validation test ran completely
        // console.log('expectsForInvalidBody ran for invalidity', invalidity);
      };

      // test function for all bodys in this block
      const testForInvalidPasswordBody = async (
        statusCode: number,
        invalidity: string,
        invalidPasswordBody: any,
      ) => {
        // define Body to be used in this test
        const passwordBody = invalidPasswordBody;

        // login Bodo4, let him create Item with passed in Body
        const connectSidValue = await loginBodo4();

        // change password
        const changePasswordResponse = await request(app)
          .post(
            `${userRoute}/${bodosUserId}/${
              userIdChangePasswordRoute.split(':userId/').slice(-1)[0]
            }`,
          )
          .send(passwordBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout
        await logout(connectSidValue);

        expectsForInvalidPasswordBody(
          statusCode,
          invalidity,
          changePasswordResponse,
        );
      };

      // old and new PW are equal
      const invalidPasswordBody1 = {
        oldPassword: 'bodo4',
        newPassword: 'bodo4',
      };

      // only old PW given
      const invalidPasswordBody2 = {
        oldPassword: 'bodo4',
        // newPassword: 'bodo4',
      };

      // only new PW given
      const invalidPasswordBody3 = {
        // oldPassword: 'bodo4',
        newPassword: 'bodo44',
      };

      // invalid field given
      const invalidPasswordBody4 = {
        oldPassword: 'bodo4',
        newPassword: 'bodo44',
        color: 'blue',
      };

      // empty body
      const invalidPasswordBody5 = {
        // oldPassword: 'bodo4',
        // newPassword: 'bodo4',
      };

      // incorrect old PW
      const invalidPasswordBody6 = {
        oldPassword: 'bodo444',
        newPassword: 'bodo44',
      };

      describe('should respond error with a statusCode400', () => {
        it('for old and new passwords being equal', async () => {
          await testForInvalidPasswordBody(
            400,
            'Error: pick new password',
            invalidPasswordBody1,
          );
        }, 10000);
        it('for only old password given', async () => {
          await testForInvalidPasswordBody(
            400,
            'Error: &quot;newPassword&quot; is required<br> &nbsp; &nbsp;at validatePasswordChange',
            invalidPasswordBody2,
          );
        }, 10000);
        it('for only new password given', async () => {
          await testForInvalidPasswordBody(
            400,
            'Error: &quot;oldPassword&quot; is required<br> &nbsp; &nbsp;at validatePasswordChange',
            invalidPasswordBody3,
          );
        }, 10000);
        it('for invalid field given', async () => {
          await testForInvalidPasswordBody(
            400,
            'Error: &quot;color&quot; is not allowed<br> &nbsp; &nbsp;at validatePasswordChange',
            invalidPasswordBody4,
          );
        }, 10000);
        it('for empty body', async () => {
          await testForInvalidPasswordBody(
            400,
            'Error: &quot;oldPassword&quot; is required<br> &nbsp; &nbsp;at validatePasswordChange',
            invalidPasswordBody5,
          );
        }, 10000);
      });

      describe('should respond error with a statusCode500', () => {
        it('for old PW incorrect', async () => {
          await testForInvalidPasswordBody(
            500,
            'IncorrectPasswordError: Password or username is incorrect',
            invalidPasswordBody6,
          );
        }, 10000);
      });
    });
  });
});
