import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';

// type Definintions
import { ChangeSettingsRequest } from '../../src/typeDefinitions';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  userIdSettingsRoute,
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

  describe(`PUT ${userIdSettingsRoute}`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn(
      'put',
      `${userRoute}/65673cc5811318fde3968147/${
        userIdSettingsRoute.split(':userId/').slice(-1)[0]
      }`,
    );

    // check if isUser throws appropriate errors
    notPassedIsUser(
      'put',
      userRoute,
      userIdSettingsRoute.split(':userId/').slice(-1)[0],
    );

    // define valid input
    describe('when valid settings body is given', () => {
      describe('should respond successful with a statusCode200 and user data ', () => {
        // expect statements for all tests in this block
        const expectsForValidBody = (
          settingsBody: { newUserData: ChangeSettingsRequest },
          changeSettingsResponse: request.Response,
        ) => {
          // expects

          expect(changeSettingsResponse.statusCode).toBe(200);

          // expect the body[0] to resemble the data inputs from validUpdateBody
          const updatedUserSettings = changeSettingsResponse.body;
          expect(updatedUserSettings).toEqual(
            // checkUserDataToBeCorrectlyProcessedItemForClient(settingsBody),
            {
              phone: {
                countryCode: settingsBody.newUserData.phone?.countryCode,
                number: settingsBody.newUserData.phone?.number,
              },
              address: {
                street: settingsBody.newUserData.address?.street,
                plz: settingsBody.newUserData.address?.plz,
                city: settingsBody.newUserData.address?.city,
              },
              _id: '6553b5bfa70b16a991b89001',
              email: 'bodo4@gmail.com',
              __v: expect.any(Number),
              creationDate: '2023-11-16T11:42:55.615Z',
              lastName: settingsBody.newUserData.lastName,
              firstName: settingsBody.newUserData.firstName,
              getHistory: expect.any(Array),
              getItems: expect.any(Array),
              searchHistory: expect.any(Array),
              myItems: expect.any(Array),
            },
          );

          // log for checking that all validation test ran completely
          // console.log('expectsForValidBody ran with', updatedUserSettings.email);
        };

        const testForValidBody = async (validSettingsBody: {
          newUserData: ChangeSettingsRequest;
        }) => {
          const settingsBody = validSettingsBody;

          // login Bodo4, let him change his settings with passed in Body
          const connectSidValue = await loginBodo4();

          // change settings
          const changeSettingsResponse = await request(app)
            .put(
              `${userRoute}/${bodosUserId}/${
                userIdSettingsRoute.split(':userId/').slice(-1)[0]
              }`,
            )
            .send(settingsBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // logout
          await logout(connectSidValue);

          // console.log(changeSettingsResponse.text);

          expectsForValidBody(settingsBody, changeSettingsResponse);
        };

        // for input including a fully filled newUserData Object
        const validSettingsBody1: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for input including a fully filled newUserData Object', async () => {
          await testForValidBody(validSettingsBody1);
        });

        // for lastName is empty string
        const validSettingsBody2: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: '',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for lastName is empty string', async () => {
          await testForValidBody(validSettingsBody2);
        });

        // for phone.countryCode has + and 2 numbers
        const validSettingsBody3: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+12', number: '3456789012' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for phone.countryCode has + and 2 numbers', async () => {
          await testForValidBody(validSettingsBody3);
        });

        // for phone.number is empty string
        const validSettingsBody4: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for phone.number is empty string', async () => {
          await testForValidBody(validSettingsBody4);
        });

        // for phone.number has 9 digits
        const validSettingsBody5: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '123456789' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for phone.number has 9 digits', async () => {
          await testForValidBody(validSettingsBody5);
        });

        // for phone.number has 10 digits
        const validSettingsBody6: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '1234567890' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for phone.number has 10 digits', async () => {
          await testForValidBody(validSettingsBody6);
        });

        // for phone.number has 11 digits
        const validSettingsBody7: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '12345678901' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for phone.number has 11 digits', async () => {
          await testForValidBody(validSettingsBody7);
        });

        // for address.street is empty string
        const validSettingsBody8: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: '',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        it('for address.street is empty string', async () => {
          await testForValidBody(validSettingsBody8);
        });

        // for address.plz is empty string
        const validSettingsBody9: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '',
              city: 'Down Town',
            },
          },
        };
        it('for address.plz is empty string', async () => {
          await testForValidBody(validSettingsBody9);
        });

        // for address.city is empty string
        const validSettingsBody10: { newUserData: ChangeSettingsRequest } = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: '',
            },
          },
        };
        it('for address.city is empty string', async () => {
          await testForValidBody(validSettingsBody10);
        });
      });
    });
    describe('when invalid settings body is given', () => {
      // expect statements for all tests in this block
      const expectsForInvalidSettingsBody = (
        statusCode: number,
        invalidity: string,
        changeSettingsResponse: request.Response,
      ) => {
        // console.log(changeSettingsResponse.statusCode, changeSettingsResponse.error);

        // expects
        expect(changeSettingsResponse.statusCode).toBe(statusCode);
        expect(changeSettingsResponse.text).toContain(invalidity);

        // log for checking that all validation test ran completely
        // console.log('expectsForInvalidBody ran for invalidity', invalidity);
      };

      // test function for all bodys in this block
      const testForInvalidSettingsBody = async (
        statusCode: number,
        invalidity: string,
        invalidSettingsBody: any,
      ) => {
        // define Body to be used in this test
        const settingsBody = invalidSettingsBody;

        // login Bodo4, let him create Item with passed in Body
        const connectSidValue = await loginBodo4();

        // change settings
        const changeSettingsResponse = await request(app)
          .put(
            `${userRoute}/${bodosUserId}/${
              userIdSettingsRoute.split(':userId/').slice(-1)[0]
            }`,
          )
          .send(settingsBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout
        await logout(connectSidValue);

        expectsForInvalidSettingsBody(
          statusCode,
          invalidity,
          changeSettingsResponse,
        );
      };

      describe('should respond error with a statusCode400', () => {
        // for empty body object
        const invalidSettingsBody1 = {
          // no newUserData
        };
        // test
        it('for empty body object', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody1,
          );
        }, 10000);

        // for empty newUserData object
        const invalidSettingsBody2 = {
          newUserData: {
            //  everything missing
          },
        };
        // test
        it('for empty newUserData object', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.firstName&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody2,
          );
        }, 10000);

        // for missing firstName
        const invalidSettingsBody3 = {
          newUserData: {
            //   firstName missing
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for missing firstName', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.firstName&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody3,
          );
        }, 10000);

        // for firstName is an empty string
        const invalidSettingsBody4 = {
          newUserData: {
            firstName: '', // fistName empty string
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for firstName is an empty string', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.firstName&quot; is not allowed to be empty<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody4,
          );
        }, 10000);

        // for missing lastName
        const invalidSettingsBody5 = {
          newUserData: {
            firstName: 'bodo4',
            // lastName is missing
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };

        // test
        it('for missing lastName', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.lastName&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody5,
          );
        }, 10000);

        // for missing phone
        const invalidSettingsBody6 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            // phone is missing
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for missing phone', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody6,
          );
        }, 10000);

        // for missing phone.countryCode
        const invalidSettingsBody7 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              // countryCode is missing
              number: '17298086213',
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for missing phone.countryCode', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.countryCode&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody7,
          );
        }, 10000);

        // for phone.countryCode is an empty string
        const invalidSettingsBody8 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '', // empty string
              number: '17298086213',
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for phone.countryCode is an empty string', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.countryCode&quot; is not allowed to be empty<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody8,
          );
        }, 10000);

        // for phone.countryCode lacks + in the first position
        const invalidSettingsBody9 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '49', // lacks +
              number: '17298086213',
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for phone.countryCode lacks + in the first position', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.countryCode&quot; with value &quot;49&quot; fails to match the required pattern: /^\\+\\d{1,3}$/<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody9,
          );
        }, 10000);

        // for phone.countryCode has 4 numbers
        const invalidSettingsBody10 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '+4935', // 4 digits
              number: '17298086213',
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for phone.countryCode has 4 numbers', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.countryCode&quot; with value &quot;+4935&quot; fails to match the required pattern: /^\\+\\d{1,3}$/<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody10,
          );
        }, 10000);

        // for missing phone.number
        const invalidSettingsBody11 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '+49',
              // number is missing
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for missing phone.number', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.number&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody11,
          );
        }, 10000);

        // for phone.number has less than 9 digits
        const invalidSettingsBody12 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '+49',
              number: '12345678', // less than 9 digits
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for phone.number has less than 9 digits', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.number&quot; length must be at least 9 characters long<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody12,
          );
        }, 10000);

        // for phone.number has more than 11 digits
        const invalidSettingsBody13 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '+49',
              number: '123456789012', // more than 11 digits
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for phone.number has more than 11 digits', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.number&quot; length must be less than or equal to 11 characters long<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody13,
          );
        }, 10000);

        // for phone.number is a number
        const invalidSettingsBody14 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '+49',
              number: 17298086213, // should be a string
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for phone.number is a number', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.number&quot; must be a string<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody14,
          );
        }, 10000);

        // for phone.number does contain other string values than digits
        const invalidSettingsBody15 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: {
              countryCode: '+49',
              number: '17298a086213', // contains non-digit characters
            },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for phone.number does contain other string values than digits', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.phone.number&quot; with value &quot;17298a086213&quot; fails to match the required pattern: /^\\d*$/<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody15,
          );
        }, 10000);

        // for missing address
        const invalidSettingsBody16 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            // address is missing
          },
        };
        // test
        it('for missing address', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.address&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody16,
          );
        }, 10000);

        // for missing address.street
        const invalidSettingsBody17 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              // street is missing
              plz: '79543',
              city: 'Down Town',
            },
          },
        };
        // test
        it('for missing address.street', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.address.street&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody17,
          );
        }, 10000);

        // for missing address.plz
        const invalidSettingsBody18 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              // plz is missing
              city: 'Down Town',
            },
          },
        };
        // test
        it('for missing address.plz', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.address.plz&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody18,
          );
        }, 10000);

        // for address.plz has less than 5 digits
        const invalidSettingsBody18a = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '795', // less than 5 digits
              city: 'Down Town',
            },
          },
        };
        // test
        it('for address.plz has less than 5 digits', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.address.plz&quot; with value &quot;795&quot; fails to match the required pattern: /^\\d{5}$/<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody18a,
          );
        }, 10000);

        // for address.plz has more than 5 digits
        const invalidSettingsBody18b = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '7954563', //more than 5 digits
              city: 'Down Town',
            },
          },
        };

        // test
        it('for address.plz has more than 5 digits', async () => {
          await testForInvalidSettingsBody(
            400,
            '>Error: &quot;newUserData.address.plz&quot; with value &quot;7954563&quot; fails to match the required pattern: /^\\d{5}$/<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody18b,
          );
        }, 10000);

        // for address.plz containing other value than number
        const invalidSettingsBody18c = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '123m5', //contianing a non digit value
              city: 'Down Town',
            },
          },
        };
        // test
        it('for address.plz containing other value than number', async () => {
          await testForInvalidSettingsBody(
            400,
            '>Error: &quot;newUserData.address.plz&quot; with value &quot;123m5&quot; fails to match the required pattern: /^\\d{5}$/<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody18c,
          );
        }, 10000);

        // for missing address.city
        const invalidSettingsBody19 = {
          newUserData: {
            firstName: 'bodo4',
            lastName: 'The Big',
            phone: { countryCode: '+49', number: '17298086213' },
            address: {
              street: 'Hans-Meyer-Str',
              plz: '79543',
              // city is missing
            },
          },
        };
        // test
        it('for missing address.city', async () => {
          await testForInvalidSettingsBody(
            400,
            'Error: &quot;newUserData.address.city&quot; is required<br> &nbsp; &nbsp;at validateUserData',
            invalidSettingsBody19,
          );
        }, 10000);
      });
    });
  });
});
