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
  itemIdInteractionIdRoute,
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

const notPassedItemInteractionBelongsToItem = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when itemInteractionBelongsToItem was not passed', () => {
    describe('when invalid itemId is given', () => {
      const invalidInteractionIdOfCorrectPattern = '65673cc5811318fde3968158';
      it('should respond error with a statusCode400 for not existing itemId', async () => {
        // id has correct pattern, but item doesnt exist
        const invalidItemIdOfCorrectPattern = '65673cc5811318fde3968147';

        // login bodo4
        const connectSidValue = await loginBodo4();

        // try route in question with wrong id
        const response = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${invalidItemIdOfCorrectPattern}/${routeEnd}/${invalidInteractionIdOfCorrectPattern}`,
          )
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('expect 400:', response.statusCode, response.text);
        // expect route in question to throw 400
        expect(response.statusCode).toBe(400);
        expect(response.text).toContain(
          'Error: Bad Request: This item does not exist',
        );

        // logout bodo4
        await logout(connectSidValue);
      }, 10000);
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
            [httpVerb](
              `${routeBase}/${invalidId}/${routeEnd}/${invalidInteractionIdOfCorrectPattern}`,
            )
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
      }, 10000);
    });

    describe('when invalid interactionId is given', () => {
      it('should respond error with a statusCode400 for not existing interactionId', async () => {
        // id has correct pattern, but item doesnt exist
        const invalidInteractionIdOfCorrectPattern = '65673cc5811318fde3968158';

        // login bodo4
        const connectSidValue = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // try route in question with wrong id
        const response = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeEnd}/${invalidInteractionIdOfCorrectPattern}`,
          )
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('expect 400:', response.statusCode, response.text);
        // expect route in question to throw 400
        expect(response.statusCode).toBe(400);
        expect(response.text).toContain(
          'Error: Bad Request: This interaction does not exist',
        );

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout bodo4
        await logout(connectSidValue);
      }, 10000);

      it('should respond error with a statusCode500 for interactionId value that could not be cast to ObjectId', async () => {
        // login bodo4
        const connectSidValue = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        const invalidInteractionIdOfWrongPattern = '65673cc58318fde3968147';
        const invalidInteractionIdOfWrongPattern2 = 'hi';
        // TODO ER: I get a 500 for this one - what is happening here?
        // const invalidInteractionIdOfWrongPattern3 = '(ksd%=ks-.."9'; // URIError: Failed to decode param &#39;(ksd%=ks-..%229&#39;

        const invalidIDs = [
          invalidInteractionIdOfWrongPattern,
          invalidInteractionIdOfWrongPattern2,
          // invalidInteractionIdOfWrongPattern3,
        ];
        for (const invalidId of invalidIDs) {
          // try route in question with wrong id
          const response = await (request(app) as any)
            [httpVerb](`${routeBase}/${itemId}/${routeEnd}/${invalidId}`)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // console.log('expect 500:', response.statusCode, response.text);
          // expect route in question to throw 500
          expect(response.statusCode).toBe(500);
          expect(response.text).toContain(
            'CastError: Cast to ObjectId failed for value',
          );
        }

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout bodo4
        await logout(connectSidValue);
      }, 10000);
    });

    describe('when the interaction does not exist on the item', () => {
      it('should respond error with a statusCode400', async () => {
        // bodo4 creates 2 items, on item 2 bibi opens a request
        // check if middleware throws an error, when itemId1 and interactionId on item2 are used in one request

        // login Bodo4, let him create 2 Items
        const connectSidValueBodo4First = await loginBodo4();

        // create item 1
        const createItemResponse1 = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId1 = createItemResponse1.body[0]._id;

        // create item 2
        const createItemResponse2 = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId2 = createItemResponse2.body[0]._id;

        // logout
        await logout(connectSidValueBodo4First);

        // login bibi
        const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

        // bibi opens a interaction
        const itemInteractionResponse = await request(app)
          .post(
            `${itemRoute}/${itemId2}/${
              itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
            }`,
          )
          .send({
            itemInteraction: {
              status: 'opened',
              message:
                'Interaction on Item 2 of testing itemInteractionBelongsToItem middleware',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
        // extract interactionId
        const interactionIdOnItem2 =
          itemInteractionResponse.body[0].interactions[0]._id;

        // try route in question with wrong pairing of Id's
        const itemInteractionIdResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId1}/${routeEnd}/${interactionIdOnItem2}`,
          )
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

        // console.log('expect 400:', response.statusCode, response.text);
        // expect route in question to throw 400
        expect(itemInteractionIdResponse.statusCode).toBe(400);
        expect(itemInteractionIdResponse.text).toContain(
          'Error: Bad Request: The requested item and interaction do not match!',
        );
      }, 10000);
    });
  });
};

const notPassedIsInteractionPartaker = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when isInteractionPartaker was not passed', () => {
    describe('when the user is neither item.owner nor interaction.interestedParty', () => {
      it('should respond error with a statusCode403', async () => {
        // bodo4 creates an item on which bibi opens a request
        // check if middleware throws an error when bob tries to access /item/bobsItem/itemInteraction/bibisInteraction

        // login Bodo4, let him create an item
        const connectSidValueBodo4First = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing isInteractionPartaker middleware',
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

        // bibi opens a interaction
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
                'Interaction on Item 2 of testing isInteractionPartaker middleware',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
        // extract interactionId
        const interactionIdOnItem =
          itemInteractionResponse.body[0].interactions[0]._id;

        // logout bibi
        await logout(connectSidValueBibi);

        // login bob
        const connectSidValueBob = await loginUser('bob@gmail.com', 'bob');

        // try route in question using the correct pairing of Ids, but beeing neither item.owner nor interaction.interestedParty
        const itemInteractionIdResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeEnd}/${interactionIdOnItem}`,
          )
          .set('Cookie', [`connect.sid=${connectSidValueBob}`]);

        // logout bob
        await logout(connectSidValueBob);

        // login Bodo4
        const connectSidValueBodo4Second = await loginBodo4();

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

        // logout
        await logout(connectSidValueBodo4Second);

        // console.log('expect 403:', response.statusCode, response.text);
        // expect route in question to throw 403
        expect(itemInteractionIdResponse.statusCode).toBe(403);
        expect(itemInteractionIdResponse.text).toContain(
          'Error: Forbidden: You do not have permission to do that!',
        );
      }, 10000);
    });
  });
};

const expectsForError = (
  statusCode: number,
  invalidity: string,
  response: request.Response,
) => {
  // console.log(response.statusCode, response.error);

  // expects
  expect(response.statusCode).toBe(statusCode);
  expect(response.text).toContain(invalidity);

  // log for checking that all validation test ran completely
  // console.log('expectsForError ran for invalidity', invalidity);
};

const notPassedValidateItemInteraction = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when validateItemInteraction was not passed', () => {
    describe('when invalid itemInteraction Body is given', () => {
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

        // bibi opens a interaction
        const openItemInteractionResponse = await request(app)
          .post(
            `${itemRoute}/${itemId}/${
              itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
            }`,
          )
          .send({
            itemInteraction: {
              status: 'opened',
              message: 'opening interaction for validateItem',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
        // extract interactionId
        const interactionIdOnItem =
          openItemInteractionResponse.body[0].interactions[0]._id;

        // test route of interest on just created item + interaction pairing
        const handleItemInteractionResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeEnd}/${interactionIdOnItem}`,
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

        expectsForError(statusCode, invalidity, handleItemInteractionResponse);
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

  describe(`POST ${itemIdInteractionIdRoute} (handle interaction)`, () => {
    // // check if isLoggedIn throws appropriate errors
    // notPassedIsLoggedIn(
    //   'post',
    //   `${itemRoute}/65673cc5811318fde3968147/${
    //     itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
    //   }/65673cc5811318fde3968158`,
    // );
    // // check if itemInteractionBelongsToItem throws appropriate errors
    // notPassedItemInteractionBelongsToItem(
    //   'post',
    //   itemRoute,
    //   itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    // );
    // // check if isInteractionPartaker throws appropriate errors
    // notPassedIsInteractionPartaker(
    //   'post',
    //   itemRoute,
    //   itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    // );
    // // check if validateItemInteraction throws appropriate errors
    // notPassedValidateItemInteraction(
    //   'post',
    //   itemRoute,
    //   itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    // );

    describe('when itemInteraction body is dealt with at controller', () => {
      describe('for current interactionStatus is opened', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request
          describe('when owner', () => {
            // test: login bodo4, create item, logout bodo4, login bibi, have bibi open an interaction, logout bibi,
            // login bodo4, get showItem, have bodo4 do the request of interest, get showItem, delete all of bodo4's items, logout bodo4
            const testForOwnerRequestingWrongStatus = async (
              statusCode: number,
              invalidity: string,
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // login Bodo4, let him create Item with passed in Body
              const connectSidValueBodo4First = await loginBodo4();

              // create item
              const createItemResponse = await request(app)
                .post(itemRoute)
                .send({
                  item: {
                    name: 'Item for testForOwnerRequestingWrongStatus',
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

              // bibi opens an interaction
              const openItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteraction: {
                    status: 'opened',
                    message:
                      'opening interaction for testForOwnerRequestingWrongStatus',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              // logout bibi
              await logout(connectSidValueBibi);

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              //getShowItem before request of interest
              const getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // do request of interst
              const handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              //getShowItem after request of interest
              const getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expect(getShowItemResponseBefore.body[0]).not.toBe(undefined);
              expect(getShowItemResponseBefore.body[0]).toEqual(
                getShowItemResponseAfter.body[0],
              );

              expectsForError(
                statusCode,
                invalidity,
                handleItemInteractionResponse,
              );
            };

            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test
            const validItemInteractionBody = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForOwnerRequestingWrongStatus(
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBody,
              );
            }, 10000);
          });
          describe('when interestedParty', () => {
            // test: login bodo4, create item, logout bodo4, login bibi, have bibi open an interaction, get showItem, have bibi do the request of interest, get showItem, logout bibi,
            // login bodo4, delete all of bodo4's items, logout bodo4

            const testForInterestedPartyRequestingWrongStatus = async (
              statusCode: number,
              invalidity: string,
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // login Bodo4, let him create Item with passed in Body
              const connectSidValueBodo4First = await loginBodo4();

              // create item
              const createItemResponse = await request(app)
                .post(itemRoute)
                .send({
                  item: {
                    name: 'Item for testForInterestedPartyRequestingWrongStatus',
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

              // bibi opens an interaction
              const openItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteraction: {
                    status: 'opened',
                    message:
                      'opening interaction for testForInterestedPartyRequestingWrongStatus',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              //getShowItem before request of interest
              const getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // do request of interst
              const handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              //getShowItem after request of interest
              const getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // logout bibi
              await logout(connectSidValueBibi);

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expect(getShowItemResponseBefore.body[0]).toEqual(
                getShowItemResponseAfter.body[0],
              );

              expectsForError(
                statusCode,
                invalidity,
                handleItemInteractionResponse,
              );
            };

            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test
            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForInterestedPartyRequestingWrongStatus(
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
              );
            }, 10000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForInterestedPartyRequestingWrongStatus(
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 10000);
          });
        });
        // describe('should respond successful with a statusCode200 and item data', () => {
        //   describe('for status opened', () => {
        //     it('', async () => {});
        //   });
        //   describe('for status declined', () => {
        //     it('', async () => {});
        //   });
        //   describe('for status accepted', () => {
        //     it('', async () => {});
        //   });
        // });
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

      console.log(
        'all tests in itemInteractionIdRoutesPOST-handleInteraction.test.ts ran',
      );
    }, 10000);
  });
});
