import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import { ItemInteractionRequest } from '../../src/typeDefinitions';

import getFutureDate from '../../src/utils/getFutureDate';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  authRoute,
  itemRoute,
  itemIdInteractionRoute,
  itemIdToggleAvailabilityRoute,
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
  itemInteraction: ItemInteractionRequest;
}) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testing valid itemInteraction',
    available: false,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: expect.any(String),
    owner: false,
    interactions: [
      {
        revealOwnerIdentity: false,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: validBody.itemInteraction.status,
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: validBody.itemInteraction.message
          ? [
              {
                messageText: validBody.itemInteraction.message,
                messageWriter: 'getter',
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              },
            ]
          : [],
        interestedParty: bibisUserId,
        interactionStatus: validBody.itemInteraction.status,
        dueDate: expect.any(String),
        __v: 0,
      },
    ],
    commonCommunity: {
      _id: '6544be0f04b3ecd121538985',
      picture:
        'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
      name: 'our common community',
    },
    ownerData: null,
  };

  return correctlyProcessedItemInteractionForClient;
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
        // login bodo4, create an item, get itemId, do request of interest, delete item, logout bodo4
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

        // test route of interest on just created item
        const itemInteractionResponse = await (request(app) as any)
          [httpVerb](`${routeBase}/${itemId}/${routeEnd}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout bodo4
        await logout(connectSidValue);

        // console.log('expect 403:', itemInteractionResponse.statusCode, itemInteractionResponse.text );
        // expect route in question to throw 403
        expect(itemInteractionResponse.statusCode).toBe(403);
        expect(itemInteractionResponse.text).toContain(
          'Error: Forbidden: You do not have permission to do that!',
        );
      }, 10000);
    });
  });
};

const notPassedValidateItemInteraction = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when validateItemInteraction was not passed', () => {
    describe('when invalid itemInteraction Body is given', () => {
      // expect statements for all tests in this block
      const expectsForInvalidItemInteractionBody = (
        statusCode: number,
        invalidity: string,
        itemInteractionResponse: request.Response,
      ) => {
        // console.log(itemInteractionResponse.statusCode, itemInteractionResponse.error);

        // expects
        expect(itemInteractionResponse.statusCode).toBe(statusCode);
        expect(itemInteractionResponse.text).toContain(invalidity);

        // log for checking that all validation test ran completely
        // console.log('expectsForInvalidBody ran for invalidity', invalidity);
      };

      // test function for all bodys in this block
      const testForInvalidItemInteractionBody = async (
        statusCode: number,
        invalidity: string,
        invalidItemInteractionBody: any,
      ) => {
        // define Body to be used in this test
        const itemInteractionBody = invalidItemInteractionBody;

        // login Bodo4, let him create Item with passed in Body
        const connectSidValueBodo4First = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing validateItemInteraction',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // logout
        await logout(connectSidValueBodo4First);

        // login bibi
        const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

        // test route of interest on just created item
        const itemInteractionResponse = await (request(app) as any)
          [httpVerb](`${routeBase}/${itemId}/${routeEnd}`)
          .send(itemInteractionBody)
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

        // logout bibi
        await logout(connectSidValueBibi);

        // login Bodo4, let him create Item with passed in Body
        const connectSidValueBodo4Second = await loginBodo4();

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

        // logout
        await logout(connectSidValueBodo4Second);

        expectsForInvalidItemInteractionBody(
          statusCode,
          invalidity,
          itemInteractionResponse,
        );
      };

      describe('should respond error with a statusCode400', () => {
        // for missing status
        const invalidItemInteractionBody1 = {
          itemInteraction: {
            // status : 'opened',
            message: 'some string',
            dueDate: '2024-02-11',
          },
        };

        it('for missing status', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.status&quot; is required<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody1,
          );
        }, 10000);

        // for invalid status
        const invalidItemInteractionBody2 = {
          itemInteraction: {
            status: 'invalidStatus',
            message: 'some string',
            dueDate: '2024-02-11',
          },
        };

        it('for invalid status', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.status&quot; must be one of [opened, declined, accepted, closed]<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody2,
          );
        }, 10000);

        // for empty body
        const invalidItemInteractionBody3 = {};

        it('for empty body', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction&quot; is required<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody3,
          );
        }, 10000);

        // for empty itemInteraction
        const invalidItemInteractionBody4 = {
          itemInteraction: {},
        };

        it('for empty itemInteraction', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.status&quot; is required<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody4,
          );
        }, 10000);

        // for due Date in wrong date format
        const invalidItemInteractionBody5 = {
          itemInteraction: {
            status: 'opened',
            message: 'some string',
            dueDate: '2024/02/11',
          },
        };

        it('for due Date in wrong date format', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.dueDate&quot; must be in YYYY-MM-DD format<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody5,
          );
        }, 10000);

        // for message is not a string
        const invalidItemInteractionBody6 = {
          itemInteraction: {
            status: 'opened',
            message: 123,
            dueDate: '2024-02-11',
          },
        };

        it('for message is not a string', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.message&quot; must be a string<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody6,
          );
        }, 10000);
      });
    });
  });
};

const getFutureDateForBody = (weeks = 2): string => {
  const futureDate = getFutureDate(weeks);

  // Formatting the date to 'YYYY-MM-DD'
  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  const day = String(futureDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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

    // check if isItemAvailable throws appropriate errors
    notPassedIsItemAvailable(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    );

    // check if isNotOwner throws appropriate errors
    notPassedIsNotOwner(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    );

    // check if validateItemInteraction throws appropriate errors
    notPassedValidateItemInteraction(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    );

    describe('when itemInteraction body is dealt with at controller', () => {
      // setting up the valid dueDate that lies 4 weeks in the future - so that the test might pass any time in the future as well

      const validDueDate = getFutureDateForBody(4);

      describe('should respond successful with a statusCode200 and item data', () => {
        // expect statements for all tests in this block
        const expectsForValidItemInteractionBody = (
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          itemInteractionResponse: request.Response,
        ) => {
          // console.log(itemInteractionResponse.statusCode, itemInteractionResponse.error);

          // expects
          expect(itemInteractionResponse.statusCode).toBe(200);
          // expect the body array to only have one object inside
          expect(itemInteractionResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from validUpdateBody
          const updatedItem = itemInteractionResponse.body[0];
          expect(updatedItem).toEqual(
            checkResponseToBeCorrectlyProcessedItemForClient(
              itemInteractionBody,
            ),
          );
          // this does not yet check the Dates sufficiently, thus:
          // expect creation date of interaction to equal timestamp used in statusChangeLog
          expect(
            new Date(updatedItem.interactions[0].creationDate)
              .toISOString()
              .split('T')[0],
          ).toEqual(
            new Date(
              updatedItem.interactions[0].statusChangesLog[0].entryTimestamp,
            )
              .toISOString()
              .split('T')[0],
          );

          // expect the dueDate on the item to be the same as in the interaction
          expect(updatedItem.dueDate).toBe(updatedItem.interactions[0].dueDate);
          //  for the dueDate on the response there are 2 options, either it is the set one from the Body or today in 2 weeks
          // definitions for all 3 values
          const todaysDate = new Date().toISOString().split('T')[0];
          const responseDueDate = new Date(updatedItem.dueDate)
            .toISOString()
            .split('T')[0];
          // console.log('respDD', responseDueDate);
          const twoWeeksFromNowDueDate = getFutureDateForBody(2);
          // console.log('2wDD', twoWeeksFromNowDueDate);
          const requestDueDate = itemInteractionBody.itemInteraction.dueDate;
          // console.log('reqDD', requestDueDate);

          if (!requestDueDate) {
            expect(responseDueDate).toBe(twoWeeksFromNowDueDate);
            // console.log('no due date was given');
          } else if (requestDueDate <= todaysDate) {
            expect(responseDueDate).toBe(twoWeeksFromNowDueDate);
            // console.log('due date was given as before today');
          } else {
            expect(responseDueDate).toBe(requestDueDate);
            // console.log('good due date was given');
          }

          // log for checking that all validation test ran completely
          // console.log('expectsForValidBody ran with', updatedItem);
        };

        // test function for all bodys in this block
        const testForValidItemInteractionBody =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // login Bodo4, let him create Item with passed in Body
            const connectSidValueBodo4First = await loginBodo4();

            // create item
            const createItemResponse = await request(app)
              .post(itemRoute)
              .send({
                item: {
                  name: 'Item for testing valid itemInteraction',
                  categories: { Other: { subcategories: ['Sonstiges'] } },
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
            // extract itemId
            const itemId = createItemResponse.body[0]._id;

            // logout
            await logout(connectSidValueBodo4First);

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // test route of interest on just created item
            const itemInteractionResponse = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }`,
              )
              .send(itemInteractionBody)
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4, let him create Item with passed in Body
            const connectSidValueBodo4Second = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // logout
            await logout(connectSidValueBodo4Second);

            expectsForValidItemInteractionBody(
              itemInteractionBody,
              itemInteractionResponse,
            );
          };

        describe('for status opened ', () => {
          // with message text and future dueDate
          const validItemInteractionBody1: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'opened',
              message: 'opening interaction',
              dueDate: validDueDate,
            },
          };
          it('with message text and future dueDate', async () => {
            await testForValidItemInteractionBody(validItemInteractionBody1);
          }, 10000);

          // with message text is empty string and a future dueDate
          const validItemInteractionBody2: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'opened',
              message: '',
              dueDate: validDueDate,
            },
          };
          it('with message text is empty string and a future dueDate', async () => {
            await testForValidItemInteractionBody(validItemInteractionBody2);
          }, 10000);

          // with no message but a future dueDate
          const validItemInteractionBody3: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'opened',
              // no message
              dueDate: validDueDate,
            },
          };
          it('with no message but a future dueDate', async () => {
            await testForValidItemInteractionBody(validItemInteractionBody3);
          }, 10000);

          // with message text and a past dueDate
          const validItemInteractionBody4: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'opened',
              message: 'opening interaction',
              dueDate: '2023-05-10',
            },
          };
          it('with message text and a past dueDate', async () => {
            await testForValidItemInteractionBody(validItemInteractionBody4);
          }, 10000);

          // with message text and a no dueDate
          const validItemInteractionBody5: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'opened',
              message: 'opening interaction',
              // no dueDate
            },
          };
          it('with message text and a no dueDate', async () => {
            await testForValidItemInteractionBody(validItemInteractionBody5);
          }, 10000);

          // with message text and empty sting for dueDate
          const validItemInteractionBody6: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'opened',
              message: 'opening interaction',
              dueDate: '2023-05-10',
            },
          };
          it('with message text and empty sting for dueDate', async () => {
            await testForValidItemInteractionBody(validItemInteractionBody6);
          }, 10000);

          // with message text and today for dueDate
          const validItemInteractionBody7: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'opened',
              message: 'opening interaction',
              dueDate: new Date().toISOString().split('T')[0],
            },
          };
          it('with message text and today for dueDate', async () => {
            await testForValidItemInteractionBody(validItemInteractionBody7);
          }, 10000);

          it('and push itemId to user.getItems', async () => {
            // login Bodo4, let him create Item with passed in Body
            const connectSidValueBodo4First = await loginBodo4();

            // create item
            const createItemResponse = await request(app)
              .post(itemRoute)
              .send({
                item: {
                  name: 'Item for testing valid itemInteraction',
                  categories: { Other: { subcategories: ['Sonstiges'] } },
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
            // extract itemId
            const itemId = createItemResponse.body[0]._id;

            // logout
            await logout(connectSidValueBodo4First);

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // test route of interest on just created item
            const itemInteractionResponse = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }`,
              )
              .send({
                itemInteraction: {
                  status: 'opened',
                  message:
                    'opening interaction for test of pushing item to user.getItems',
                  dueDate: validDueDate,
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

            // get users detail to extract getItems
            const authResponse = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            // extract getItems array
            // console.log('Bibis getItems', authResponse.body.getItems);

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4, let him create Item with passed in Body
            const connectSidValueBodo4Second = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // logout
            await logout(connectSidValueBodo4Second);

            // expects
            expect(itemInteractionResponse.statusCode).toBe(200);
            // expect the itemId to be the last id in the users getItems array
            expect(itemId).toBe(
              authResponse.body.getItems[authResponse.body.getItems.length - 1],
            );
          }, 10000);
        });
      });
      describe('should respond error with a statusCode400', () => {
        // expect statements for all tests in this block
        const expectsForInvalidItemInteractionBody = (
          statusCode: number,
          invalidity: string,
          itemInteractionResponse: request.Response,
        ) => {
          // console.log(itemInteractionResponse.statusCode, itemInteractionResponse.error);

          // expects
          expect(itemInteractionResponse.statusCode).toBe(statusCode);
          expect(itemInteractionResponse.text).toContain(invalidity);

          // log for checking that all validation test ran completely
          // console.log('expectsForInvalidBody ran for invalidity', invalidity);
        };

        // test function for all bodys in this block
        const testForInvalidItemInteractionBody = async (
          statusCode: number,
          invalidity: string,
          invalidItemInteractionBody: any,
        ) => {
          // define Body to be used in this test
          const itemInteractionBody = invalidItemInteractionBody;

          // login Bodo4, let him create Item with passed in Body
          const connectSidValueBodo4First = await loginBodo4();

          // create item
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send({
              item: {
                name: 'Item for testing invalidity handling in controller',
                categories: { Other: { subcategories: ['Sonstiges'] } },
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
          // extract itemId
          const itemId = createItemResponse.body[0]._id;

          // logout
          await logout(connectSidValueBodo4First);

          // login bibi
          const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

          // test route of interest on just created item
          const itemInteractionResponse = await request(app)
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }`,
            )
            .send(itemInteractionBody)
            .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

          // logout bibi
          await logout(connectSidValueBibi);

          // login Bodo4, let him create Item with passed in Body
          const connectSidValueBodo4Second = await loginBodo4();

          // delete all items
          const deleteAllOfUsersItemsResponse = await request(app)
            .delete(itemRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

          // logout
          await logout(connectSidValueBodo4Second);

          expectsForInvalidItemInteractionBody(
            statusCode,
            invalidity,
            itemInteractionResponse,
          );
        };
        describe('for status NOT opened', () => {
          // but in accepted values array included value, with message text and future dueDate
          const invalidItemInteractionBody1: {
            itemInteraction: ItemInteractionRequest;
          } = {
            itemInteraction: {
              status: 'closed',
              message: 'opening interaction',
              dueDate: validDueDate,
            },
          };
          it('but in accepted values array included value', async () => {
            await testForInvalidItemInteractionBody(
              400,
              'Error: Bad Request: You cant create an interaction with this request',
              invalidItemInteractionBody1,
            );
          }, 10000);
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
