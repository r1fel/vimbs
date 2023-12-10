import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';

const app = makeApp(database);

// routes
const loginRoute = '/auth/login';
const registerRoute = '/auth/register';
const logoutRoute = '/auth/logout';
const authRoute = '/auth';

// frequently used functions
const loginBodo4 = async () => {
  const response = await request(app).post(loginRoute).send({
    email: 'bodo4@gmail.com',
    password: 'bodo4',
  });
  return response;
};

describe(`POST ${loginRoute}`, () => {
  describe('when both email and password are given', () => {
    it('should respond successful login with statusCode200, body._id and body.email for correct credentials', async () => {
      const loginBodo4response = await loginBodo4();

      // Access the headers and get the 'set-cookie' header
      const setCookieHeader = loginBodo4response.headers['set-cookie'];
      // Extract the connect.sid value from the 'set-cookie' header
      const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];
      // console.log('connect.sid value:', connectSidValue);

      const logoutResponse = await request(app)
        .post(logoutRoute)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);

      expect(loginBodo4response.statusCode).toBe(200);
      expect(loginBodo4response.body._id.toString()).toEqual(
        '6553b5bfa70b16a991b89001',
      );
      expect(loginBodo4response.body.email).toBe('bodo4@gmail.com');
    }, 10000);

    it('should respond error with statusCode401 for invalid credentials', async () => {
      const bodyData = [
        // Test Case 1: Wrong password
        { email: 'bodo4@gmail.com', password: 'bodo5' },
        // Test Case 2: Email does not exist in DB
        { email: 'bodo7@gmail.com', password: 'bodo5' },
      ];

      for (const body of bodyData) {
        const response = await request(app).post(loginRoute).send(body);
        expect(response.statusCode).toBe(401);
      }
    });
    // it('should respond error with a statusCode400 for invalid field(s)', async () => {
    //   // add field(s) to inout
    // });
  });

  describe('when email or password or both are missing', () => {
    it('should respond error with a statusCode400', async () => {
      const bodyData = [
        { email: 'bodo4@gmail.com' },
        { password: 'bodo4' },
        {},
      ];
      for (const body of bodyData) {
        const response = await request(app).post('/auth/login').send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });
});

describe(`POST ${registerRoute}`, () => {
  describe('when both email and password are given', () => {
    it('should respond successful register with statusCode200, body._id and body.email', async () => {
      // actually creating user in the DB
      const response = await request(app).post(registerRoute).send({
        email: 'register-auth-test-user@gmail.com',
        password: 'register-auth-test-user',
      });
      // deleting user from DB - since it was a test
      await request(app).delete(`/user/${response.body._id}/deleteUser`).send({
        deletionPW:
          'ifYouDontKnowThisPWToBeSentInTheBody,YouAreNotAllowedToDeleteAnyUsers',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body._id).toBeDefined();
      expect(response.body.email).toBeDefined();
    }, 10000);

    it('should respond error with statusCode500 if user/given email already exists in UserDB', async () => {
      const response = await request(app).post(registerRoute).send({
        email: 'bodo4@gmail.com',
        password: 'bodo4',
      });
      expect(response.statusCode).toBe(500);
    });
    // it('should respond error with a statusCode400 for invalid field(s)', async () => {
    //   // add field(s) to inout
    // });
  });

  describe('when email or password or both are missing', () => {
    it('should respond error with a statusCode400 from UserAuthValidation', async () => {
      const bodyData = [
        { email: 'bodo8@gmail.com' },
        { password: 'bodo8' },
        {},
      ];
      for (const body of bodyData) {
        const response = await request(app).post(registerRoute).send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });
});

// working version by bypassing isLoggedIn
// import * as Functions from '../../src/utils/middleware/functionForMocking';

// describe.skip('GET /auth', () => {
//   it('should respond successful with a statusCode 200', async () => {
//     jest.spyOn(Functions, 'isAuthenticated').mockReturnValue(true);

//     const response = await request(app).get('/auth');

//     // Check the response
//     expect(response.statusCode).toBe(200);
//   });
// });

describe(`GET ${authRoute}`, () => {
  it('should respond successful with a statusCode 200 and user data for existing req.user and ongoing session', async () => {
    const loginBodo4response = await loginBodo4();

    // Access the headers and get the 'set-cookie' header
    const setCookieHeader = loginBodo4response.headers['set-cookie'];
    // Extract the connect.sid value from the 'set-cookie' header
    const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];

    const authResponse = await request(app)
      .get(authRoute)
      .set('Cookie', [`connect.sid=${connectSidValue}`]);

    const logoutResponse = await request(app)
      .post(logoutRoute)
      .set('Cookie', [`connect.sid=${connectSidValue}`]);

    // Check the response
    expect(authResponse.statusCode).toBe(200);
    expect(authResponse.body._id.toString()).toEqual(
      '6553b5bfa70b16a991b89001',
    );
    expect(authResponse.body.email).toBe('bodo4@gmail.com');
  });
});

// describe.skip('GET /auth', () => {
//   it('should respond successful with a statusCode200 and user data for existing req.user and ongoing session', async () => {
//     // Mock isAuthenticated to return true
//     jest.spyOn(require('express'), 'Request').mockReturnValue({
//       isAuthenticated: jest.fn().mockReturnValue(true),
//       user: { _id: 'user_id', email: 'user@example.com' },
//     });

//     const response = await request(app).get('/auth');

//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({
//       _id: 'user_id',
//       email: 'user@example.com',
//     });
//   });
//   // it('should respond error with a statusCode401 if req.user undefined', async () => {
//   //
//   // });
//   // it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
//   //
//   // });
// });

describe(`POST ${logoutRoute}`, () => {
  it('should respond successful with a statusCode200 for a previously logged in user', async () => {
    const loginBodo4response = await loginBodo4();

    // Access the headers and get the 'set-cookie' header
    const setCookieHeader = loginBodo4response.headers['set-cookie'];
    // Extract the connect.sid value from the 'set-cookie' header
    const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];
    // console.log('connect.sid value:', connectSidValue);

    const logoutResponse = await request(app)
      .post(logoutRoute)
      .set('Cookie', [`connect.sid=${connectSidValue}`]);

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.text).toBe('successfully logged out!');
  });
  it('should respond error with a statusCode401 for NO previously logged in user', async () => {
    const logoutResponse = await request(app).post(logoutRoute);

    expect(logoutResponse.statusCode).toBe(401);
  });
  // it('should respond error with a statusCode401 for any passed in body', async () => {
  //   //
  //   });
});

// describe('GET /auth/google', () => {
// it('should respond successful login with statusCode200, body._id and body.email for existing google user', async () => {
// //
// });
// it('should respond successful login with statusCode200, body._id and body.email for newly logged in google user', async () => {
//   //
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
// });

console.log('all tests in authRoutes.test.ts ran');
