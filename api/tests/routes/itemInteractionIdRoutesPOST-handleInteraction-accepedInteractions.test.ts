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

// for AcceptedOnAccepted
const checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnAccepted = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingAcceptedOnAcceptedStatus',
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
              'opening interaction for testForRequestingAcceptedOnAcceptedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'accepting interaction for testForRequestingAcceptedOnAcceptedStatus',
            messageWriter: 'giver',
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

// for ClosedOnAccepted
const checkResponseToBeCorrectlyProcessedItemForClientClosedOnAccepted = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingClosedOnAcceptedStatus',
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
          {
            newStatus: 'closed',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingClosedOnAcceptedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'accepting interaction for testForRequestingClosedOnAcceptedStatus',
            messageWriter: 'giver',
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
        interactionStatus: 'closed',
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
      // current interactionStatus is opened tested in itemInteractionIdRoutesPOST-handleInteraction-openedInteractions.test.ts
      // current interactionStatus is declined tested in itemInteractionIdRoutesPOST-handleInteraction-declinedInteractions.test.ts
      // current interactionStatus is closed tested in itemInteractionIdRoutesPOST-handleInteraction-closedInteractions.test.ts
      // mulitple Interactions tested in itemInteractionIdRoutesPOST-handleInteraction-multipleInteractions.test.ts
      describe('for current interactionStatus is accepted', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request

          // test: bodo4 creates an item,
          // bibi opens interaction,
          // login bodo4, accept interaction, [if giver: get showItem, have bodo4 do the request of interest, get showItem,] logout bodo4,
          // [if getter: login bibi, get showItem, have bibi do the request of interest, get showItem, logout bibi,]
          // login bodo4, delete all of bodo4's items, logout bodo4
          const testForRequestingWrongStatusOnAccepted = async (
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
              'testForRequestingWrongStatusOnAccepted',
            );

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              'testForRequestingWrongStatusOnAccepted',
            );

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            // bodo4 accepts interaction
            const handleItemInteractionResponseAccepting = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}`,
              )
              .send({
                itemInteraction: {
                  status: 'accepted',
                  message:
                    'accepting interaction for testForRequestingWrongStatusOnAccepted',
                  dueDate: getFutureDateForBody(4),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            let getShowItemResponseBefore: any = undefined;
            let handleItemInteractionResponse: any = undefined;
            let getShowItemResponseAfter: any = undefined;
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

            // logout
            await logout(connectSidValueBodo4Second);

            if (interactingParty === 'getter') {
              // login bibi
              const connectSidValueBibi = await loginUser(
                'bibi@gmail.com',
                'bibi',
              );

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

              // logout bibi
              await logout(connectSidValueBibi);
            }

            // login Bodo4
            const connectSidValueBodo4Third = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

            // logout
            await logout(connectSidValueBodo4Third);

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
            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyDeclined = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status declined', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyDeclined,
              );
            }, 20000);
          });
          describe('when interestedParty', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test

            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodydeclined = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status declined', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodydeclined,
              );
            }, 10000);

            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
              );
            }, 10000);
          });
        });
        describe('should respond successful with a statusCode200 and item data', () => {
          describe('for status accepted', () => {
            // expect statements for all tests in this block
            const expectsForAcceptedOnAccepted = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );

              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnAccepted(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog no new entry, interactionStatus: 'accepted',
              //  messagelog includes new message, item.dueDate: present and checked by following expects

              // the above does not yet check the dates sufficiently, thus
              // item.dueDate: possibly changed for giver/same as before for getter
              // the interactionDueDate is checked to be the same as on opening by bibi
              // for interactingParty = getter and if owner sent not valid or no dueDate
              // or the interactionDueDate is checked to as set by the owner for valid dueDate

              const bodosInteractionAcceptanceDueDate = getFutureDateForBody(4); // set in the test by bodo4 in the interaction acceptance request
              const givenDueDate = itemInteractionBody.itemInteraction.dueDate;

              if (
                interactingParty === 'giver' &&
                givenDueDate &&
                new Date(givenDueDate) >= new Date()
              ) {
                // console.log('if with valid due Date');
                expect(
                  new Date(updatedItem.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(givenDueDate);
                expect(
                  new Date(updatedItem.dueDate).toISOString().split('T')[0],
                ).toEqual(givenDueDate);
              } else {
                // console.log('if withOUT due Date/ no valid due Date or getter');
                expect(
                  new Date(updatedItem.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(bodosInteractionAcceptanceDueDate);
                expect(
                  new Date(updatedItem.dueDate).toISOString().split('T')[0],
                ).toEqual(bodosInteractionAcceptanceDueDate);
              }
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'accepted',
                message: '', // empty string
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'accepted',
                // message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
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
                // dueDate: getFutureDateForBody(3/7),
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
            // login bodo4, accept interaction, [if giver: have bodo4 do the request of interest,] logout bodo4,
            // [if getter: login bibi, have bibi do the request of interest, logout bibi,]
            // login bodo4, delete all of bodo4's items, logout bodo4
            const testForRequestingAcceptedOnAcceptedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingAcceptedOnAcceptedStatus',
              );

              // bibi opens interaction
              const interactionIdOnItem = await bibiOpensInteraction(
                itemId,
                'testForRequestingAcceptedOnAcceptedStatus',
              );

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              // bodo4 accepts interaction
              const handleItemInteractionResponseAccepting = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'accepted',
                    message:
                      'accepting interaction for testForRequestingAcceptedOnAcceptedStatus',
                    dueDate: getFutureDateForBody(4),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              let handleItemInteractionResponse: any = undefined;
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

              // logout
              await logout(connectSidValueBodo4Second);

              if (interactingParty === 'getter') {
                // login bibi
                const connectSidValueBibi = await loginUser(
                  'bibi@gmail.com',
                  'bibi',
                );

                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                // logout bibi
                await logout(connectSidValueBibi);
              }

              // login Bodo4
              const connectSidValueBodo4Third = await loginBodo4();

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

              // logout
              await logout(connectSidValueBodo4Third);

              expectsForAcceptedOnAccepted(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner - possibly changing dueDate', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);
            });

            describe('requested by interestedParty', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 20000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 20000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 20000);

              it('with message text and no dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 20000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 20000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 20000);
            });
          });
          describe('for status closed', () => {
            // expect statements for all tests in this block
            const expectsForClosedOnAccepted = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );

              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientClosedOnAccepted(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog no new entry, interactionStatus: 'accepted',
              //  messagelog includes new message, item.dueDate: null

              // the above does not yet check if interaction dueDate still what it was before, thus
              const bodosInteractionAcceptanceDueDate = getFutureDateForBody(4); // set in the test by bodo4 in the interaction acceptance request

              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(bodosInteractionAcceptanceDueDate);
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'closed',
                message: '', // empty string
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'closed',
                // message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                // dueDate: getFutureDateForBody(3/7),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item,
            // bibi opens interaction,
            // login bodo4, accept interaction, have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4,
            const testForRequestingClosedOnAcceptedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingClosedOnAcceptedStatus',
              );

              // bibi opens interaction
              const interactionIdOnItem = await bibiOpensInteraction(
                itemId,
                'testForRequestingClosedOnAcceptedStatus',
              );

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              // bodo4 accepts interaction
              const handleItemInteractionResponseAccepting = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'accepted',
                    message:
                      'accepting interaction for testForRequestingClosedOnAcceptedStatus',
                    dueDate: getFutureDateForBody(4),
                  },
                })
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

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expectsForClosedOnAccepted(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);

              it('and remove itemId from interestedParty.getItems and add it to interestedParty.getHistory', async () => {
                // expect statement
                const expectsForClosedOnAcceptedConcerningArraysOnUser = (
                  itemId: string,
                  authResponseAfterOpening: request.Response,
                  authResponseAfterClosing: request.Response,
                ) => {
                  // expects
                  expect(authResponseAfterOpening.statusCode).toBe(200);

                  //  itemId is only supposed to be in getItems and none of the other arrays after opening
                  expect(authResponseAfterOpening.body.myItems).not.toContain(
                    itemId,
                  );
                  expect(authResponseAfterOpening.body.getItems).toContain(
                    itemId,
                  );
                  expect(
                    authResponseAfterOpening.body.getHistory,
                  ).not.toContain(itemId);

                  // expects
                  expect(authResponseAfterClosing.statusCode).toBe(200);

                  //  itemId is only supposed to not be in getItems after closing, but be moved to getHistory
                  expect(authResponseAfterClosing.body.myItems).not.toContain(
                    itemId,
                  );
                  expect(authResponseAfterClosing.body.getItems).not.toContain(
                    itemId,
                  );
                  expect(authResponseAfterClosing.body.getHistory).toContain(
                    itemId,
                  );
                };

                // test: bodo4 creates an item,
                // login bibi, open an interaction, get auth, logout bibi,
                // login bodo4, accept interaction, close interaction, logout bodo4,
                // login bibi, get auth, logout bibi,
                // login bodo4, delete all of bodo4's items, logout bodo4,
                const testForClosedOnAcceptedConcerningArraysOnUser =
                  async () => {
                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForClosedOnAcceptedConcerningArraysOnUser',
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
                            'opening interaction for testForClosedOnAcceptedConcerningArraysOnUser',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItem =
                      openItemInteractionResponse.body[0].interactions[0]._id;

                    // bibi calles auth
                    const authResponseBibiPastOpening = await request(app)
                      .get(authRoute)
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // bodo4 accepts the interaction
                    const handleItemInteractionResponseAccepting =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItem}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'accepted',
                            message:
                              'accepting interaction for testForClosedOnAcceptedConcerningArraysOnUser',
                            dueDate: getFutureDateForBody(4),
                          },
                        })
                        .set('Cookie', [
                          `connect.sid=${connectSidValueBodo4Second}`,
                        ]);

                    // bodo4 closes the interaction
                    const handleItemInteractionResponseClosing = await request(
                      app,
                    )
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItem}`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'closed',
                          message:
                            'closing interaction for testForClosedOnAcceptedConcerningArraysOnUser',
                          dueDate: getFutureDateForBody(4),
                        },
                      })
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    // login bibi
                    const connectSidValueBibiSesond = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi calles auth
                    const authResponseBibiPastClosing = await request(app)
                      .get(authRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBibiSesond}`,
                      ]);

                    // logout bibi
                    await logout(connectSidValueBibiSesond);

                    // login Bodo4
                    const connectSidValueBodo4Third = await loginBodo4();

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Third}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Third);

                    // console.log(
                    //   'authResponseBibiPastOpening',
                    //   authResponseBibiPastOpening.body,
                    // );
                    // console.log(
                    //   'authResponseBibiPastClosing',
                    //   authResponseBibiPastClosing.body,
                    // );
                    expectsForClosedOnAcceptedConcerningArraysOnUser(
                      itemId,
                      authResponseBibiPastOpening,
                      authResponseBibiPastClosing,
                    );
                  };

                await testForClosedOnAcceptedConcerningArraysOnUser();
              }, 20000);

              it('and remove itemId from interestedParty.getItems and NOT add it to interestedParty.getHistory if it already is in getHistory', async () => {
                // expect statement when previous to the accepted interaction, there was another interaction on the item
                const expectsForClosedOnAcceptedConcerningArraysOnUserSecondInteraction =
                  (
                    itemId: string,
                    authResponseAfterOpening: request.Response,
                    authResponseAfterClosing: request.Response,
                  ) => {
                    // expects
                    expect(authResponseAfterOpening.statusCode).toBe(200);

                    //  itemId is supposed to be in getItems and get History
                    expect(authResponseAfterOpening.body.myItems).not.toContain(
                      itemId,
                    );
                    expect(authResponseAfterOpening.body.getItems).toContain(
                      itemId,
                    );
                    expect(authResponseAfterOpening.body.getHistory).toContain(
                      itemId,
                    );

                    // expects
                    expect(authResponseAfterClosing.statusCode).toBe(200);

                    //  itemId is only supposed to not be in getItems after closing, but be moved to getHistory
                    expect(authResponseAfterClosing.body.myItems).not.toContain(
                      itemId,
                    );
                    expect(
                      authResponseAfterClosing.body.getItems,
                    ).not.toContain(itemId);
                    expect(authResponseAfterClosing.body.getHistory).toContain(
                      itemId,
                    );
                    expect(
                      authResponseAfterClosing.body.getHistory.filter(
                        (item: any) => item === itemId,
                      ),
                    ).toHaveLength(1);
                  };

                // test: bodo4 creates an item,
                // login bibi, open an interaction, decline the interaction, open another interaction, get auth, logout bibi,
                // login bodo4, accept interaction, close interaction, logout bodo4,
                // login bibi, get auth, logout bibi,
                // login bodo4, delete all of bodo4's items, logout bodo4,
                const testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction =
                  async () => {
                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                    );

                    // login bibi
                    const connectSidValueBibi = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi opens first interaction
                    const openItemInteractionResponseFirstInteraction =
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
                              'opening interaction 1 for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItemFirstInteraction =
                      openItemInteractionResponseFirstInteraction.body[0]
                        .interactions[0]._id;

                    // bibi declines this first interaction
                    const handleItemInteractionResponseDeclining =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItemFirstInteraction}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'declined',
                            message:
                              'declining interaction 1 for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // bibi opens another interaction
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
                            'opening interaction 2 for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItem =
                      openItemInteractionResponse.body[0].interactions[0]._id;

                    // bibi calles auth
                    const authResponseBibiPastOpening = await request(app)
                      .get(authRoute)
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // bodo4 accepts the interaction
                    const handleItemInteractionResponseAccepting =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItem}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'accepted',
                            message:
                              'accepting interaction for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                            dueDate: getFutureDateForBody(4),
                          },
                        })
                        .set('Cookie', [
                          `connect.sid=${connectSidValueBodo4Second}`,
                        ]);

                    // bodo4 closes the interaction
                    const handleItemInteractionResponseClosing = await request(
                      app,
                    )
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItem}`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'closed',
                          message:
                            'closing interaction for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                          dueDate: getFutureDateForBody(4),
                        },
                      })
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    // login bibi
                    const connectSidValueBibiSesond = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi calles auth
                    const authResponseBibiPastClosing = await request(app)
                      .get(authRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBibiSesond}`,
                      ]);

                    // logout bibi
                    await logout(connectSidValueBibiSesond);

                    // login Bodo4
                    const connectSidValueBodo4Third = await loginBodo4();

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Third}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Third);

                    // console.log(
                    //   'authResponseBibiPastOpening',
                    //   authResponseBibiPastOpening.body,
                    // );
                    // console.log(
                    //   'authResponseBibiPastClosing',
                    //   authResponseBibiPastClosing.body,
                    // );
                    expectsForClosedOnAcceptedConcerningArraysOnUserSecondInteraction(
                      itemId,
                      authResponseBibiPastOpening,
                      authResponseBibiPastClosing,
                    );
                  };

                await testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction();
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
