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

// for DeclinedOnDeclined
const checkResponseToBeCorrectlyProcessedItemForClientDeclinedOnDeclined = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingDeclinedOnDeclinedStatus',
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
            newStatus: 'declined',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingDeclinedOnDeclinedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'declining interaction for testForRequestingDeclinedOnDeclinedStatus',
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
        interactionStatus: 'declined',
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
      // current interactionStatus is acceped tested in itemInteractionIdRoutesPOST-handleInteraction-accepedInteractions.test.ts
      // current interactionStatus is closed tested in itemInteractionIdRoutesPOST-handleInteraction-closedInteractions.test.ts
      // mulitple Interactions tested in itemInteractionIdRoutesPOST-handleInteraction-multipleInteractions.test.ts

      describe('for current interactionStatus is declined', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request

          // test: bodo4 creates an item,
          // login bibi, have bibi open an interaction, have bibi decline the interaction, [if getter: get showItem,  have bibi do the request of interest, get showItem,], logout bibi,
          // login bodo4, [if giver: get showItem,  have bodo4 do the request of interest, get showItem,] delete all of bodo4's items, logout bodo4,
          const testForRequestingWrongStatusOnDeclined = async (
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
              'testForRequestingWrongStatusOnDeclined',
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
                    'opening interaction for testForRequestingWrongStatusOnDeclined',
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            // extract interactionId
            const interactionIdOnItem =
              openItemInteractionResponse.body[0].interactions[0]._id;

            //bibi declines the interaction
            const handleItemInteractionResponseDeclining = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}`,
              )
              .send({
                itemInteraction: {
                  status: 'declined',
                  message:
                    'declining interaction for testForRequestingWrongStatusOnDeclined',
                  dueDate: getFutureDateForBody(4),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

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
            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 20000);

            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
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
              await testForRequestingWrongStatusOnDeclined(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 20000);

            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
              );
            }, 20000);
          });
        });
        describe('should respond successful with a statusCode200 and item data', () => {
          describe('for status declined', () => {
            // expect statements for all tests in this block
            const expectsForDeclinedOnDeclined = (
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
                checkResponseToBeCorrectlyProcessedItemForClientDeclinedOnDeclined(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
              //  statusChangeLog no new entry, interactionStatus: 'declined',
              //  messagelog includes new message, item.dueDate: null

              // the above does not yet check the interaction.dueDate sufficiently,
              // it should not have changed from what it was set upon declining

              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(new Date().toISOString().split('T')[0]);
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'declined',
                message: '', // empty string
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'declined',
                // message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
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
                // dueDate: getFutureDateForBody(3/7),
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

            // test: bodo4 creates an item,
            // login bibi, have bibi open an interaction, decline interaction, [if getter: have bibi do the request of interest] logout bibi,
            // login bodo4,  [if giver: have bodo4 do the request of interest,]  delete all of bodo4's items, logout bodo4,
            const testForRequestingDeclinedOnDeclinedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingDeclinedOnDeclinedStatus',
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
                      'opening interaction for testForRequestingDeclinedOnDeclinedStatus',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              // bibi declines interaction
              const handleItemInteractionResponseDeclining = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'declined',
                    message:
                      'declining interaction for testForRequestingDeclinedOnDeclinedStatus',
                    dueDate: getFutureDateForBody(4),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

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

              expectsForDeclinedOnDeclined(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);
            });

            describe('requested by interestedParty', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 20000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 20000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 20000);

              it('with message text and no dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 20000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 20000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
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
