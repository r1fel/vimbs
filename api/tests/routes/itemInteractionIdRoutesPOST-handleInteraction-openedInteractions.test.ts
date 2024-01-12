import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import { ItemInteractionRequest } from '../../src/typeDefinitions';

import getFutureDate from '../../src/utils/getFutureDate';

// predefined Strings
import { noProfilePicture } from '../../src/utils/processItemForClientStringDefinitions';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  authRoute,
  itemRoute,
  itemIdInteractionRoute,
  itemIdInteractionIdRoute,
  bibisUserId,
  bobsUserId,
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

// for DeclinedOnOpened
const checkResponseToBeCorrectlyProcessedItemForClient = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingDeclinedOnOpenedStatus',
    available: true,
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
    dueDate: null,
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: false,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: validBody.itemInteraction.status,
            changeInitiator: interactingParty,
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingDeclinedOnOpenedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: interactingParty,
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: validBody.itemInteraction.status,
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData: null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for OpenedOnOpened
const checkResponseToBeCorrectlyProcessedItemForClientOpenedOnOpened = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingOpenedOnOpenedStatus',
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
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: false,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingOpenedOnOpenedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: interactingParty,
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'opened',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData: null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for AcceptedOnOpened
const checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnOpened = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingAcceptedOnOpenedStatus',
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
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: true,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'accepted',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingAcceptedOnOpenedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: 'giver',
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'accepted',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData:
      interactingParty === 'getter'
        ? {
            _id: expect.any(String),
            name: 'bodo4 The Big',
            email: 'bodo4@gmail.com',
            picture: noProfilePicture,
            phone: '+4917298086213',
          }
        : null,
  };

  return correctlyProcessedItemInteractionForClient;
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

const getFutureDateForBody = (weeks = 2): string => {
  const futureDate = getFutureDate(weeks);

  // Formatting the date to 'YYYY-MM-DD'
  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  const day = String(futureDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const bodo4CreatesItem = async (testName: string) => {
  // login Bodo4, let him create Item with passed in Body
  const connectSidValueBodo4First = await loginBodo4();

  let itemId: string = 'no itemId recived from request';
  // Attempt to create item for up to 5 times
  for (let attempt = 1; attempt <= 5; attempt++) {
    // create item
    const createItemResponse = await request(app)
      .post(itemRoute)
      .send({
        item: {
          name: `Item for ${testName}`,
          categories: { Other: { subcategories: ['Sonstiges'] } },
        },
      })
      .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);

    // Check if the response is successful (status code 200) and has a valid itemId
    if (createItemResponse.status === 200 && createItemResponse.body[0]?._id) {
      itemId = createItemResponse.body[0]._id;
      // console.log('itemId attempt', attempt);
      break; // Break the loop if successful
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Logout if unsuccessful
  await logout(connectSidValueBodo4First);

  return itemId;
};

const bibiOpensInteraction = async (itemId: string, testName: string) => {
  // login bibi
  const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

  let interactionIdOnItem: string =
    'no interactionIdOnItem recived from request';
  // Attempt to create interaction for up to 5 times
  for (let attempt = 1; attempt <= 5; attempt++) {
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
          message: `opening interaction for ${testName}`,
        },
      })
      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
    // extract interactionId if the response is successful (status code 200) and has a valid interactionId
    if (
      openItemInteractionResponse.status === 200 &&
      openItemInteractionResponse.body[0].interactions[0]._id
    ) {
      interactionIdOnItem =
        openItemInteractionResponse.body[0].interactions[0]._id;
      // console.log('interactionIdOnItem attempt', attempt);
      break;
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // logout bibi
  await logout(connectSidValueBibi);

  return interactionIdOnItem;
};

// TESTS
describe('itemInteraction Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`POST ${itemIdInteractionIdRoute} (handle interaction)`, () => {
    // middleware tested in itemInteractionIdRoutesPOST-handleInteraction-middleware.test.ts
    describe('when itemInteraction body is dealt with at controller', () => {
      // current interactionStatus is acceped tested in itemInteractionIdRoutesPOST-handleInteraction-accepedInteractions.test.ts
      // current interactionStatus is declined tested in itemInteractionIdRoutesPOST-handleInteraction-declinedInteractions.test.ts
      // current interactionStatus is closed tested in itemInteractionIdRoutesPOST-handleInteraction-closedInteractions.test.ts
      // mulitple Interactions tested in itemInteractionIdRoutesPOST-handleInteraction-multipleInteractions.test.ts
      describe('for current interactionStatus is opened', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request

          // test: bodo4 creates an item,
          // login bibi, have bibi open an interaction, [if getter: get showItem, have bibi do the request of interest, get showItem,] logout bibi,
          // login bodo4, [if giver: get showItem, have bodo4 do the request of interest, get showItem,] delete all of bodo4's items, logout bodo4
          const testForRequestingWrongStatus = async (
            interactingParty: 'giver' | 'getter',
            statusCode: number,
            invalidity: string,
            validItemInteractionBody: {
              itemInteraction: ItemInteractionRequest;
            },
          ) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(
              'testForRequestingWrongStatus',
            );

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
                    'opening interaction for testForRequestingWrongStatus',
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            // extract interactionId
            const interactionIdOnItem =
              openItemInteractionResponse.body[0].interactions[0]._id;

            let getShowItemResponseBefore: any = undefined;
            let handleItemInteractionResponse: any = undefined;
            let getShowItemResponseAfter: any = undefined;
            if (interactingParty === 'getter') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            }

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            if (interactingParty === 'giver') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
            }
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

          describe('when owner', () => {
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
              await testForRequestingWrongStatus(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBody,
              );
            }, 20000);
          });
          describe('when interestedParty', () => {
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
              await testForRequestingWrongStatus(
                'getter',
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
              await testForRequestingWrongStatus(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 10000);
          });
        });
        describe('should respond successful with a statusCode200 and item data', () => {
          describe('for status opened', () => {
            // expect statements for all tests in this block
            const expectsForOpenedOnOpened = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientOpenedOnOpened(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: false, ownerData: null,
              //  statusChangeLog no new entry, interactionStatus: 'opened',
              //  messagelog includes new message, item.dueDate: same as before

              // this does not yet check the dates sufficiently, thus
              // the interactionDueDate is checked to be the date set by bibi when opening the interaction by
              const dueDateSetByBibiUponOpeningInteraction =
                getFutureDateForBody(2);
              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(dueDateSetByBibiUponOpeningInteraction);
              expect(
                new Date(updatedItem.dueDate).toISOString().split('T')[0],
              ).toEqual(dueDateSetByBibiUponOpeningInteraction);
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'opened',
                message: '', // empty string
                dueDate: getFutureDateForBody(4),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'opened',
                // message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                // dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item, login bibi, have bibi open an interaction, if interactingParty=getter - have bibi do request of interest, logout bibi,
            // login bodo4, if interactingParty=giver - have bodo4 do request of interest, delete all of bodo4's items, logout bodo4
            const testForRequestingOpenedOnOpenedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingOpenedOnOpenedStatus',
              );

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
                      'opening interaction for testForRequestingOpenedOnOpenedStatus',
                    dueDate: getFutureDateForBody(2),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              let handleItemInteractionResponse: any = undefined;
              if (interactingParty === 'getter') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              }

              // logout bibi
              await logout(connectSidValueBibi);

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              if (interactingParty === 'giver') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              }

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expectsForOpenedOnOpened(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);
            });

            describe('requested by interestedParty', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 10000);
            });
          });

          describe('for status declined', () => {
            // expect statements for all tests in this block
            const expectsForDeclinedOnOpened = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClient(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
              //  statusChangeLog with new entry, interactionStatus: 'declined',
              //  messagelog includes new message, item.dueDate: null

              // this does not yet check the dates sufficiently, thus
              // the interactionDueDate is checked to be today by
              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(new Date().toISOString().split('T')[0]);
              // further dates are set in other requests, which are tested elsewhere
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'declined',
                message: '', // empty string
                dueDate: getFutureDateForBody(4),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'declined',
                // message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                // dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item, login bibi, have bibi open an interaction, if interactingParty=getter - have bibi do request of interest, logout bibi,
            // login bodo4, if interactingParty=giver - have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4
            const testForDeclinedOnOpenedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingDeclinedOnOpenedStatus',
              );

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
                      'opening interaction for testForRequestingDeclinedOnOpenedStatus',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              let handleItemInteractionResponse: any = undefined;
              if (interactingParty === 'getter') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              }

              // logout bibi
              await logout(connectSidValueBibi);

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              if (interactingParty === 'giver') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              }

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expectsForDeclinedOnOpened(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              // test: bodo4 creates an item, bibi opens interaction,
              // login bodo4, have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4

              it('with message text and future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);

              it('if interaction is not interactions[0]', async () => {
                // expect statements for all tests in this block
                const expectsForDeclinedOnOpenedSecondInteractionInArray = (
                  interactingParty: 'giver' | 'getter',
                  validBody: { itemInteraction: ItemInteractionRequest },
                  itemInteractionResponse: request.Response,
                ) => {
                  // expects
                  expect(itemInteractionResponse.statusCode).toBe(200);
                  // expect the body array to only have one object inside
                  expect(itemInteractionResponse.body).toHaveLength(1);

                  // expect the body[0] to resemble the data inputs from validUpdateBody
                  const updatedItem = itemInteractionResponse.body[0];
                  expect(updatedItem.interactions.length).toBe(2);
                  expect(updatedItem).toEqual({
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    name: 'Item for testForRequestingDeclinedOnOpenedStatus',
                    available: true,
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
                    dueDate: null,
                    owner: interactingParty === 'getter' ? false : true,
                    interactions: [
                      interactingParty === 'giver'
                        ? {
                            revealOwnerIdentity: false,
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                            creationDate: expect.any(String),
                            statusChangesLog: [
                              {
                                newStatus: 'opened',
                                changeInitiator: 'getter',
                                entryTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                              {
                                newStatus: 'declined',
                                changeInitiator: 'getter',
                                entryTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                            ],
                            messagelog: [
                              {
                                messageText:
                                  'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                                messageWriter: 'getter',
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                              {
                                messageText:
                                  'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                                messageWriter: 'getter',
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                            ],
                            interestedParty: bibisUserId,
                            interactionStatus: 'declined',
                            dueDate: expect.any(String),
                            __v: expect.any(Number),
                          }
                        : undefined,
                      {
                        revealOwnerIdentity: false,
                        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                        creationDate: expect.any(String),
                        statusChangesLog: [
                          {
                            newStatus: 'opened',
                            changeInitiator: 'getter',
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          {
                            newStatus: validBody.itemInteraction.status,
                            changeInitiator: interactingParty,
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                        ],
                        messagelog: [
                          {
                            messageText:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                            messageWriter: 'getter',
                            messageTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          validBody.itemInteraction.message
                            ? {
                                messageText: validBody.itemInteraction.message,
                                messageWriter: interactingParty,
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              }
                            : undefined,
                        ],
                        interestedParty: bobsUserId,
                        interactionStatus: validBody.itemInteraction.status,
                        dueDate: expect.any(String),
                        __v: expect.any(Number),
                      },
                    ],
                    commonCommunity:
                      interactingParty === 'getter'
                        ? {
                            _id: '6544be0f04b3ecd121538985',
                            picture:
                              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
                            name: 'our common community',
                          }
                        : null,
                    ownerData: null,
                  }); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
                  //  statusChangeLog with new entry, interactionStatus: 'declined',
                  //  messagelog includes new message, item.dueDate: null

                  // this does not yet check the dates sufficiently, thus
                  // the interactionDueDate is checked to be today by
                  expect(
                    new Date(updatedItem.interactions[0].dueDate)
                      .toISOString()
                      .split('T')[0],
                  ).toEqual(new Date().toISOString().split('T')[0]);
                  // further dates are set in other requests, which are tested elsewhere
                };

                // test: bodo4 creates an item,
                //  login bibi, open an interaction, decline an interaction, logout bibi,
                // login bob, open an interaction, logout bob
                // login bodo4, have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4
                const testForOwnerRequestingDeclinedOnOpenedStatusForSecondInteractionInArray =
                  async (
                    interactingParty: 'giver' | 'getter',
                    validItemInteractionBody: {
                      itemInteraction: ItemInteractionRequest;
                    },
                  ) => {
                    // define Body to be used in this test
                    const itemInteractionBody = validItemInteractionBody;

                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForRequestingDeclinedOnOpenedStatus',
                    );

                    // login bibi
                    const connectSidValueBibi = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi opens an interaction
                    const openItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItemForFirstInArray =
                      openItemInteractionResponseForFirstInArray.body[0]
                        .interactions[0]._id;

                    // bibi declines the interaction
                    const handleItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItemForFirstInArray}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'declined',
                            message:
                              'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login bob
                    const connectSidValueBob = await loginUser(
                      'bob@gmail.com',
                      'bob',
                    );

                    // bob opens an interaction
                    const openItemInteractionResponseForSecondInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBob}`]);
                    // extract interactionId
                    const interactionIdOnItemForSecondInArray =
                      openItemInteractionResponseForSecondInArray.body[0]
                        .interactions[0]._id;

                    // logout bob
                    await logout(connectSidValueBob);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // do request of interst
                    const handleItemInteractionResponse = await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItemForSecondInArray}`,
                      )
                      .send(itemInteractionBody)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    expectsForDeclinedOnOpenedSecondInteractionInArray(
                      interactingParty,
                      validItemInteractionBody,
                      handleItemInteractionResponse,
                    );
                  };

                await testForOwnerRequestingDeclinedOnOpenedStatusForSecondInteractionInArray(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 20000);
            });
            describe('requested by interestedParty', () => {
              // test: bodo4 creates an item, login bibi, have bibi open an interaction, have bibi do the request of interest, logout bibi,
              // login bodo4, delete all of bodo4's items, logout bodo4

              it('with message text and future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 10000);

              it('if interaction is not interactions[0]', async () => {
                // expect statements for all tests in this block
                const expectsForDeclinedOnOpenedSecondInteractionInArray = (
                  interactingParty: 'giver' | 'getter',
                  validBody: { itemInteraction: ItemInteractionRequest },
                  itemInteractionResponse: request.Response,
                ) => {
                  // expects
                  expect(itemInteractionResponse.statusCode).toBe(200);
                  // expect the body array to only have one object inside
                  expect(itemInteractionResponse.body).toHaveLength(1);

                  // expect the body[0] to resemble the data inputs from validUpdateBody
                  const updatedItem = itemInteractionResponse.body[0];
                  expect(updatedItem.interactions.length).toBe(1); // for owner it's 2 here only the current interaction should be sent
                  expect(updatedItem).toEqual({
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    name: 'Item for testForRequestingDeclinedOnOpenedStatus',
                    available: true,
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
                    dueDate: null,
                    owner: interactingParty === 'getter' ? false : true,
                    interactions: [
                      {
                        revealOwnerIdentity: false,
                        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                        creationDate: expect.any(String),
                        statusChangesLog: [
                          {
                            newStatus: 'opened',
                            changeInitiator: 'getter',
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          {
                            newStatus: validBody.itemInteraction.status,
                            changeInitiator: interactingParty,
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                        ],
                        messagelog: [
                          {
                            messageText:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                            messageWriter: 'getter',
                            messageTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          validBody.itemInteraction.message
                            ? {
                                messageText: validBody.itemInteraction.message,
                                messageWriter: interactingParty,
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              }
                            : undefined,
                        ],
                        interestedParty: bobsUserId,
                        interactionStatus: validBody.itemInteraction.status,
                        dueDate: expect.any(String),
                        __v: expect.any(Number),
                      },
                    ],
                    commonCommunity:
                      interactingParty === 'getter'
                        ? {
                            _id: '6544be0f04b3ecd121538985',
                            picture:
                              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
                            name: 'our common community',
                          }
                        : null,
                    ownerData: null,
                  }); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
                  //  statusChangeLog with new entry, interactionStatus: 'declined',
                  //  messagelog includes new message, item.dueDate: null

                  // this does not yet check the dates sufficiently, thus
                  // the interactionDueDate is checked to be today by
                  expect(
                    new Date(updatedItem.interactions[0].dueDate)
                      .toISOString()
                      .split('T')[0],
                  ).toEqual(new Date().toISOString().split('T')[0]);
                  // further dates are set in other requests, which are tested elsewhere
                };

                // test: bodo4 creates an item,
                //  login bibi, open an interaction, decline an interaction, logout bibi,
                // login bob, open an interaction, have bob do the request of interest, logout bob
                // login bodo4, delete all of bodo4's items, logout bodo4
                const testForInterestedPartyRequestingDeclinedOnOpenedStatusForSecondInteractionInArray =
                  async (
                    interactingParty: 'giver' | 'getter',
                    validItemInteractionBody: {
                      itemInteraction: ItemInteractionRequest;
                    },
                  ) => {
                    // define Body to be used in this test
                    const itemInteractionBody = validItemInteractionBody;

                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForRequestingDeclinedOnOpenedStatus',
                    );

                    // login bibi
                    const connectSidValueBibi = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi opens an interaction
                    const openItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItemForFirstInArray =
                      openItemInteractionResponseForFirstInArray.body[0]
                        .interactions[0]._id;

                    // bibi declines the interaction
                    const handleItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItemForFirstInArray}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'declined',
                            message:
                              'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login bob
                    const connectSidValueBob = await loginUser(
                      'bob@gmail.com',
                      'bob',
                    );

                    // bob opens an interaction
                    const openItemInteractionResponseForSecondInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBob}`]);
                    // extract interactionId
                    const interactionIdOnItemForSecondInArray =
                      openItemInteractionResponseForSecondInArray.body[0]
                        .interactions[0]._id;

                    // do request of interst
                    const handleItemInteractionResponse = await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItemForSecondInArray}`,
                      )
                      .send(itemInteractionBody)
                      .set('Cookie', [`connect.sid=${connectSidValueBob}`]);

                    // logout bob
                    await logout(connectSidValueBob);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    expectsForDeclinedOnOpenedSecondInteractionInArray(
                      interactingParty,
                      validItemInteractionBody,
                      handleItemInteractionResponse,
                    );
                  };

                await testForInterestedPartyRequestingDeclinedOnOpenedStatusForSecondInteractionInArray(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 20000);
            });

            it('and remove itemId from interestedParty.getItems and add it to interestedParty.getHistory', async () => {
              // expect statements for all tests in this block
              const expectsForDeclinedOnOpenedConcerningArraysOnUser = (
                itemId: string,
                authResponse: request.Response,
              ) => {
                // expects
                expect(authResponse.statusCode).toBe(200);

                //  itemId is only supposed to be in getHistory and none of the other arrays
                expect(authResponse.body.myItems).not.toContain(itemId);
                expect(authResponse.body.getItems).not.toContain(itemId);
                expect(authResponse.body.getHistory).toContain(itemId);
              };

              // test: bodo4 creates an item,
              //  login bibi, open an interaction, decline an interaction, get auth, logout bibi,
              // login bodo4, delete all of bodo4's items, logout bodo4
              const testForDeclinedOnOpenedConcerningArraysOnUser =
                async () => {
                  // bodo4 creates item
                  const itemId = await bodo4CreatesItem(
                    'testForRequestingDeclinedOnOpenedStatus',
                  );

                  // login bibi
                  const connectSidValueBibi = await loginUser(
                    'bibi@gmail.com',
                    'bibi',
                  );

                  // bibi opens an interaction
                  const openItemInteractionResponseForFirstInArray =
                    await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'opened',
                          message:
                            'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                  // extract interactionId
                  const interactionIdOnItemForFirstInArray =
                    openItemInteractionResponseForFirstInArray.body[0]
                      .interactions[0]._id;

                  // bibi declines the interaction
                  const handleItemInteractionResponseForFirstInArray =
                    await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItemForFirstInArray}`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'declined',
                          message:
                            'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                  // bibi calles auth
                  const authResponse = await request(app)
                    .get(authRoute)
                    .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                  // logout bibi
                  await logout(connectSidValueBibi);

                  // login Bodo4
                  const connectSidValueBodo4Second = await loginBodo4();

                  // delete all items
                  const deleteAllOfUsersItemsResponse = await request(app)
                    .delete(itemRoute)
                    .set('Cookie', [
                      `connect.sid=${connectSidValueBodo4Second}`,
                    ]);

                  // logout
                  await logout(connectSidValueBodo4Second);

                  // console.log('authResponse', authResponse.body)
                  expectsForDeclinedOnOpenedConcerningArraysOnUser(
                    itemId,
                    authResponse,
                  );
                };

              await testForDeclinedOnOpenedConcerningArraysOnUser();
            }, 20000);
          });

          describe('for status accepted', () => {
            // expect statements for all tests in this block
            const expectsForAcceptedOnOpened = (
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
              getShowItemResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );
              // console.log('getShowItemResponse.body', getShowItemResponse.text);
              // expects

              // for the itemInteractionResponse
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItemForOwner = itemInteractionResponse.body[0];
              expect(updatedItemForOwner).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnOpened(
                  'giver',
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog with new entry, interactionStatus: 'accepted',
              //  messagelog includes new message, item.dueDate: some date

              // this does not yet check the dates sufficiently, thus
              // the interactionDueDate is checked to be what the owner set

              const givenDueDate = itemInteractionBody.itemInteraction.dueDate;
              const noGivenDate = getFutureDateForBody(2);

              if (givenDueDate && new Date(givenDueDate) >= new Date()) {
                // console.log('if with valid due Date');
                expect(
                  new Date(updatedItemForOwner.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(givenDueDate);
                expect(
                  new Date(updatedItemForOwner.dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(givenDueDate);
              } else {
                // console.log('if withOUT due Date/ no valid due Date');
                expect(
                  new Date(updatedItemForOwner.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(noGivenDate);
                expect(
                  new Date(updatedItemForOwner.dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(noGivenDate);
              }
              // further dates are set in other requests, which are tested elsewhere

              // expects
              // for the getShowItemResponse from bibi
              expect(getShowItemResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(getShowItemResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody and show the ownerData
              const updatedItemForInterestedParty = getShowItemResponse.body[0];
              expect(updatedItemForInterestedParty).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnOpened(
                  'getter',
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog with second entry, interactionStatus: 'accepted',
              //  messagelog includes message from owner, item.dueDate: some date
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'accepted',
                message: '', // empty string
                dueDate: getFutureDateForBody(4),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'accepted',
                // message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                // dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item,
            // bibi opens interaction,
            // login bodo4, have bodo4 do the request of interest, logout bodo4
            // login bibi, have bibi view the item, logout bibi,
            // login bodo4, delete all of bodo4's items, logout bodo4
            const testForAcceptedOnOpenedStatus =
              async (validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              }) => {
                // define Body to be used in this test
                const itemInteractionBody = validItemInteractionBody;

                // bodo4 creates item
                const itemId = await bodo4CreatesItem(
                  'testForRequestingAcceptedOnOpenedStatus',
                );

                // bibi opens interaction
                const interactionIdOnItem = await bibiOpensInteraction(
                  itemId,
                  'testForRequestingAcceptedOnOpenedStatus',
                );

                // login Bodo4
                const connectSidValueBodo4Second = await loginBodo4();

                // do request of interst
                const handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

                // logout
                await logout(connectSidValueBodo4Second);

                // login bibi
                const connectSidValueBibiSecond = await loginUser(
                  'bibi@gmail.com',
                  'bibi',
                );

                // bibi views the item
                const getShowItemResponse = await request(app)
                  .get(`${itemRoute}/${itemId}`)
                  .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);

                // logout bibi
                await logout(connectSidValueBibiSecond);

                // login Bodo4
                const connectSidValueBodo4Third = await loginBodo4();

                // delete all items
                const deleteAllOfUsersItemsResponse = await request(app)
                  .delete(itemRoute)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

                // logout
                await logout(connectSidValueBodo4Third);

                expectsForAcceptedOnOpened(
                  validItemInteractionBody,
                  handleItemInteractionResponse,
                  getShowItemResponse,
                );
              };

            describe('requested by owner', () => {
              // test: bodo4 creates an item,
              // bibi opens interaction,
              // login bodo4, have bodo4 do the request of interest, logout bodo4
              // login bibi, have bibi view the item, logout bibi,
              // login bodo4, delete all of bodo4's items, logout bodo4

              it('with message text and future dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody1);
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody2);
              }, 20000);

              it('with no message but a future dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody3);
              }, 20000);

              it('with message text and a past dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody4);
              }, 20000);

              it('with message text and no dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody5);
              }, 20000);

              it('with message text and empty string for dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody6);
              }, 20000);

              it('with message text and today for dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody7);
              }, 20000);
            });
          });
        });
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
