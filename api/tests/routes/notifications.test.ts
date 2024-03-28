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
  bodo4sUserId,
  userRoute,
  userIdNotificationRoute,
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

const bodo4CreatesItem = async (testName: string) => {
  // login Bodo4, let him create Item with passed in Body
  const connectSidValueBodo4 = await loginBodo4();

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
      .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

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
  await logout(connectSidValueBodo4);

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

const bibiSendsItemInteractionRequest = async (
  itemId: string,
  interactionIdOnItem: string,
  itemInteractionBody: { itemInteraction: ItemInteractionRequest },
) => {
  // login bibi
  const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

  // bibis request on interaction
  const itemInteractionResponse = await request(app)
    .post(
      `${itemRoute}/${itemId}/${
        itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
      }/${interactionIdOnItem}`,
    )
    .send(itemInteractionBody)
    .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

  // logout bibi
  await logout(connectSidValueBibi);

  return itemInteractionResponse;
};

const bodo4SendsItemInteractionRequest = async (
  itemId: string,
  interactionIdOnItem: string,
  itemInteractionBody: { itemInteraction: ItemInteractionRequest },
) => {
  // login bodo4
  const connectSidValueBodo4 = await loginBodo4();

  // bodo4s request on interaction
  const itemInteractionResponse = await request(app)
    .post(
      `${itemRoute}/${itemId}/${
        itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
      }/${interactionIdOnItem}`,
    )
    .send(itemInteractionBody)
    .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

  // logout bodo4
  await logout(connectSidValueBodo4);

  return itemInteractionResponse;
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
describe('notifications', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`POST ${itemIdInteractionRoute} (open interaction)`, () => {
    describe('should set notification on owner', () => {
      const testName = 'testForNotificationOnOwnerForOpendItemInteraction';
      const expectsForNotificationOnItemInteraction = (
        itemId: string,
        interactionIdOnItem: string,
        itemInteractionBody: { itemInteraction: ItemInteractionRequest },
        authResponseNotifiedUser: request.Response,
      ) => {
        // console.log(
        //   'authResponseNotifiedUser.body',
        //   authResponseNotifiedUser.body.notifications.unread[0].body,
        // );

        // expects
        expect(authResponseNotifiedUser.statusCode).toBe(200);
        // the notification is suposed to be the only notification on the user in the unread array and its supposed to be populated
        expect(authResponseNotifiedUser.body.notifications).toEqual({
          read: [],
          unread: [
            {
              body: {
                headline: `>bibi< ist an >Item for ${testName}< interessiert`,
                ...(itemInteractionBody.itemInteraction.message
                  ? {
                      text: itemInteractionBody.itemInteraction.message,
                    }
                  : {}),
              },
              _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              emailRequired: false,
              read: false,
              timeStamp: expect.any(String),
              item: itemId,
              interaction: interactionIdOnItem,
              __v: expect.any(Number),
            },
          ],
        });
      };

      // test: create Item, open interaction with the respective body,
      // get bodo4s auth to check for notification, delete item and notifications
      const testForNotificationOnOwnerForOpendItemInteraction =
        async (validItemInteractionBody: {
          itemInteraction: ItemInteractionRequest;
        }) => {
          // define Body to be used in this test
          const itemInteractionBody = validItemInteractionBody;

          // bodo4 creates item
          const itemId = await bodo4CreatesItem(testName);

          // bibi opens interaction
          // login bibi
          const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');
          // bibi opens an interaction
          const openItemInteractionResponse = await request(app)
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }`,
            )
            .send(itemInteractionBody)
            .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
          // extract interactionId
          const interactionIdOnItem =
            openItemInteractionResponse.body[0].interactions[0]._id;

          // logout bibi
          await logout(connectSidValueBibi);

          // login Bodo4
          const connectSidValueBodo4Second = await loginBodo4();

          // bodo4 calles auth
          const authResponseNotifiedUser = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

          // delete all items
          const deleteAllOfUsersItemsResponse = await request(app)
            .delete(itemRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

          // delete all notifications
          const deleteAllOfUsersNotificationsResponse = await request(app)
            .delete(
              `${userRoute}/${bodo4sUserId}/${
                userIdNotificationRoute.split(':userId/').slice(-1)[0]
              }`,
            )
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

          // logout
          await logout(connectSidValueBodo4Second);

          expectsForNotificationOnItemInteraction(
            itemId,
            interactionIdOnItem,
            validItemInteractionBody,
            authResponseNotifiedUser,
          );
        };

      const validItemInteractionBodyWithMessage = {
        itemInteraction: {
          status: 'opened',
          message: `opening Interaction for ${testName}`,
        },
      };
      it('with itemInteraction message', async () => {
        await testForNotificationOnOwnerForOpendItemInteraction(
          validItemInteractionBodyWithMessage,
        );
      }, 10000);

      const validItemInteractionBodyWithNoMessage = {
        itemInteraction: {
          status: 'opened',
          // message: `opening Interaction for ${testName}`,
        },
      };
      it('with no itemInteraction message', async () => {
        await testForNotificationOnOwnerForOpendItemInteraction(
          validItemInteractionBodyWithNoMessage,
        );
      }, 10000);
    });
  });

  describe(`POST ${itemIdInteractionRoute} (handle interaction)`, () => {
    describe('for current interactionStatus is opened', () => {
      describe('for status opened - requested by interestedParty - and set notification', () => {
        const testName =
          'testForNotificationOnOwnerForMessageingOnOpendItemInteraction';
        const expectsForNotificationOnItemInteraction = (
          itemId: string,
          interactionIdOnItem: string,
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          authResponseNotifiedUser: request.Response,
        ) => {
          // console.log(
          //   'authResponseNotifiedUser.body',
          //   authResponseNotifiedUser.body.notifications,
          // );

          // expects
          expect(authResponseNotifiedUser.statusCode).toBe(200);
          // the notifications are suposed to be the only ones on the user in the unread array and its supposed to be populated
          // if a "messaging" request was done that doen't include a message, no new/second notification is expected
          expect(authResponseNotifiedUser.body.notifications).toEqual({
            read: [],
            unread: [
              {
                body: {
                  headline: `>bibi< ist an >Item for ${testName}< interessiert`,
                  text: `opening interaction for ${testName}`,
                },
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                emailRequired: false,
                read: false,
                timeStamp: expect.any(String),
                item: itemId,
                interaction: interactionIdOnItem,
                __v: expect.any(Number),
              },
              itemInteractionBody.itemInteraction.message
                ? {
                    body: {
                      headline: `Neue Nachricht: >bibi< zu >Item for ${testName}<`,
                      ...(itemInteractionBody.itemInteraction.message
                        ? {
                            text: itemInteractionBody.itemInteraction.message,
                          }
                        : {}),
                    },
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    emailRequired: false,
                    read: false,
                    timeStamp: expect.any(String),
                    item: itemId,
                    interaction: interactionIdOnItem,
                    __v: expect.any(Number),
                  }
                : undefined,
            ],
          });
        };

        // test: create Item, open interaction, send message
        // get bodo4s auth to check for notification, delete item and notifications
        const testForNotificationOnOwnerForMessageingOnOpendItemInteraction =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(testName);

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              testName,
            );

            // bibi sends message
            const handleItemInteractionResponseMessageOnOpened =
              await bibiSendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                itemInteractionBody,
              );

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            // bodo4 calles auth
            const authResponseNotifiedUser = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // delete all notifications
            const deleteAllOfUsersNotificationsResponse = await request(app)
              .delete(
                `${userRoute}/${bodo4sUserId}/${
                  userIdNotificationRoute.split(':userId/').slice(-1)[0]
                }`,
              )
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // logout
            await logout(connectSidValueBodo4Second);

            expectsForNotificationOnItemInteraction(
              itemId,
              interactionIdOnItem,
              validItemInteractionBody,
              authResponseNotifiedUser,
            );
          };

        const validItemInteractionBodyWithMessage = {
          itemInteraction: {
            status: 'opened',
            message: `some message on opened interaction for ${testName}`,
          },
        };
        it('on owner with a given message', async () => {
          await testForNotificationOnOwnerForMessageingOnOpendItemInteraction(
            validItemInteractionBodyWithMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessage = {
          itemInteraction: {
            status: 'opened',
            // message: `some message on opened interaction for ${testName}`,
          },
        };

        it('NOT on owner without given message', async () => {
          await testForNotificationOnOwnerForMessageingOnOpendItemInteraction(
            validItemInteractionBodyWithNoMessage,
          );
        }, 10000);
      });
      describe('for status opened - requested by owner - and set notification', () => {
        const testName =
          'testForNotificationOnOwnerForMessageingOnOpendItemInteraction';
        const expectsForNotificationOnItemInteraction = (
          itemId: string,
          interactionIdOnItem: string,
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          authResponseNotifiedUser: request.Response,
        ) => {
          // console.log(
          //   'authResponseNotifiedUser.body',
          //   authResponseNotifiedUser.body.notifications,
          // );

          // expects
          expect(authResponseNotifiedUser.statusCode).toBe(200);
          // the notification is suposed to be the only one on the user in the unread array and its supposed to be populated
          // if a "messaging/ dueDate change" request was done that doen't include a message, no new/second notification is expected
          expect(authResponseNotifiedUser.body.notifications).toEqual({
            read: [],
            unread: [
              itemInteractionBody.itemInteraction.message
                ? {
                    body: {
                      headline: `Neue Nachricht zu >Item for ${testName}<`,
                      ...(itemInteractionBody.itemInteraction.message
                        ? {
                            text: itemInteractionBody.itemInteraction.message,
                          }
                        : {}),
                    },
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    emailRequired: false,
                    read: false,
                    timeStamp: expect.any(String),
                    item: itemId,
                    interaction: interactionIdOnItem,
                    __v: expect.any(Number),
                  }
                : undefined,
            ],
          });
        };

        // test: create Item, open interaction, send message by bodo4,
        // get bibis auth to check for notification, delete item and notifications
        const testForNotificationOnOwnerForMessageingOnOpendItemInteraction =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(testName);

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              testName,
            );

            // bodo4 sends message
            const handleItemInteractionResponseMessageOnOpened =
              await bodo4SendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                itemInteractionBody,
              );

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // bibi calles auth
            const authResponseNotifiedUser = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4 = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all notifications
            const deleteAllOfUsersNotificationsResponse = await request(app)
              .delete(
                `${userRoute}/${bodo4sUserId}/${
                  userIdNotificationRoute.split(':userId/').slice(-1)[0]
                }`,
              )
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // logout
            await logout(connectSidValueBodo4);

            expectsForNotificationOnItemInteraction(
              itemId,
              interactionIdOnItem,
              validItemInteractionBody,
              authResponseNotifiedUser,
            );
          };

        const validItemInteractionBodyWithMessage = {
          itemInteraction: {
            status: 'opened',
            message: `some message on opened interaction for ${testName}`,
          },
        };
        it('on interstedParty with a given message', async () => {
          await testForNotificationOnOwnerForMessageingOnOpendItemInteraction(
            validItemInteractionBodyWithMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessage = {
          itemInteraction: {
            status: 'opened',
            // message: `some message on opened interaction for ${testName}`,
          },
        };

        it('NOT on interstedParty without given message', async () => {
          await testForNotificationOnOwnerForMessageingOnOpendItemInteraction(
            validItemInteractionBodyWithNoMessage,
          );
        }, 10000);
      });
      describe('for status declined - requested by owner - and set notification', () => {
        const testName =
          'testForNotificationOnInterestedPartyForOwnerDecliningOpenedItemInteraction';
        const expectsForNotificationOnItemInteraction = (
          itemId: string,
          interactionIdOnItem: string,
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          authResponseNotifiedUser: request.Response,
        ) => {
          // console.log(
          //   'authResponseNotifiedUser.body.notifications',
          //   authResponseNotifiedUser.body.notifications,
          // );

          // expects
          expect(authResponseNotifiedUser.statusCode).toBe(200);
          // the notification is suposed to be the only one on the user in the unread array and its supposed to be populated
          // if a "messaging/ dueDate change" request was done that doesn't include a message, no new/second notification is expected
          expect(authResponseNotifiedUser.body.notifications).toEqual({
            read: [],
            unread: [
              {
                body: {
                  headline: `Deine Anfrage zu >Item for ${testName}< wurde abgelehnt`,
                  ...(itemInteractionBody.itemInteraction.message
                    ? {
                        text: itemInteractionBody.itemInteraction.message,
                      }
                    : {}),
                },
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                emailRequired: false,
                read: false,
                timeStamp: expect.any(String),
                item: itemId,
                interaction: interactionIdOnItem,
                __v: expect.any(Number),
              },
            ],
          });
        };

        // test: create Item, open interaction, let bodo4 decline,
        // get bibis auth to check for notification, delete item and notifications
        const testForNotificationOnInterestedPartyForOwnerDecliningOpenedItemInteraction =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(testName);

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              testName,
            );

            // bodo4 declines ItemInteraction
            const handleItemInteractionResponseDeclinedOnOpened =
              await bodo4SendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                itemInteractionBody,
              );

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // bibi calles auth
            const authResponseNotifiedUser = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4 = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all notifications
            const deleteAllOfUsersNotificationsResponse = await request(app)
              .delete(
                `${userRoute}/${bodo4sUserId}/${
                  userIdNotificationRoute.split(':userId/').slice(-1)[0]
                }`,
              )
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // logout
            await logout(connectSidValueBodo4);

            expectsForNotificationOnItemInteraction(
              itemId,
              interactionIdOnItem,
              validItemInteractionBody,
              authResponseNotifiedUser,
            );
          };

        const validItemInteractionBodyWithMessage = {
          itemInteraction: {
            status: 'declined',
            message: `some message on opened interaction for ${testName}`,
          },
        };
        it('on interstedParty with a given message', async () => {
          await testForNotificationOnInterestedPartyForOwnerDecliningOpenedItemInteraction(
            validItemInteractionBodyWithMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessage = {
          itemInteraction: {
            status: 'declined',
            // message: `some message on opened interaction for ${testName}`,
          },
        };

        it('on interstedParty without given message', async () => {
          await testForNotificationOnInterestedPartyForOwnerDecliningOpenedItemInteraction(
            validItemInteractionBodyWithNoMessage,
          );
        }, 10000);
      });
      describe('for status declined - requested by interestedParty - and set notification', () => {
        const testName =
          'testForNotificationOnOwnerForInterestedPartyDecliningOpenedItemInteraction';
        const expectsForNotificationOnItemInteraction = (
          itemId: string,
          interactionIdOnItem: string,
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          authResponseNotifiedUser: request.Response,
        ) => {
          // console.log(
          //   'authResponseNotifiedUser.body.notifications',
          //   authResponseNotifiedUser.body.notifications,
          // );

          // expects
          expect(authResponseNotifiedUser.statusCode).toBe(200);
          // the notification is suposed to be the only one on the user in the unread array and its supposed to be populated
          // if a "messaging/ dueDate change" request was done that doesn't include a message, no new/second notification is expected
          expect(authResponseNotifiedUser.body.notifications).toEqual({
            read: [],
            unread: [
              {
                body: {
                  headline: `>bibi< ist an >Item for ${testName}< interessiert`,
                  text: `opening interaction for ${testName}`,
                },
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                emailRequired: false,
                read: false,
                timeStamp: expect.any(String),
                item: itemId,
                interaction: interactionIdOnItem,
                __v: expect.any(Number),
              },
              {
                body: {
                  headline: `>bibi< hat die Anfrage zu >Item for ${testName}< zurückgezogen`,
                  ...(itemInteractionBody.itemInteraction.message
                    ? {
                        text: itemInteractionBody.itemInteraction.message,
                      }
                    : {}),
                },
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                emailRequired: false,
                read: false,
                timeStamp: expect.any(String),
                item: itemId,
                interaction: interactionIdOnItem,
                __v: expect.any(Number),
              },
            ],
          });
        };
        // test: create Item, open interaction, let bibi decline,
        // get bodo4s auth to check for notification, delete item and notifications
        const testForNotificationOnOwnerForInterestedPartyDecliningOpenedItemInteraction =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(testName);

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              testName,
            );

            // bibi declines ItemInteraction
            const handleItemInteractionResponseDeclinedOnOpened =
              await bibiSendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                itemInteractionBody,
              );

            // login Bodo4
            const connectSidValueBodo4 = await loginBodo4();

            // bodo4 calles auth
            const authResponseNotifiedUser = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all notifications
            const deleteAllOfUsersNotificationsResponse = await request(app)
              .delete(
                `${userRoute}/${bodo4sUserId}/${
                  userIdNotificationRoute.split(':userId/').slice(-1)[0]
                }`,
              )
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // logout
            await logout(connectSidValueBodo4);

            expectsForNotificationOnItemInteraction(
              itemId,
              interactionIdOnItem,
              validItemInteractionBody,
              authResponseNotifiedUser,
            );
          };

        const validItemInteractionBodyWithMessage = {
          itemInteraction: {
            status: 'declined',
            message: `some message on opened interaction for ${testName}`,
          },
        };
        it('on owner with a given message', async () => {
          await testForNotificationOnOwnerForInterestedPartyDecliningOpenedItemInteraction(
            validItemInteractionBodyWithMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessage = {
          itemInteraction: {
            status: 'declined',
            // message: `some message on opened interaction for ${testName}`,
          },
        };

        it('on owner without given message', async () => {
          await testForNotificationOnOwnerForInterestedPartyDecliningOpenedItemInteraction(
            validItemInteractionBodyWithNoMessage,
          );
        }, 10000);
      });
      describe('for status accepted - requested by owner - and set notification', () => {
        const testName =
          'testForNotificationOnInterestedPartyForOwnerAcceptsOpenedItemInteraction';
        const expectsForNotificationOnItemInteraction = (
          itemId: string,
          interactionIdOnItem: string,
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          authResponseNotifiedUser: request.Response,
        ) => {
          // console.log(
          //   'authResponseNotifiedUser.body.notifications.unread',
          //   authResponseNotifiedUser.body.notifications.unread,
          // );

          // expects
          expect(authResponseNotifiedUser.statusCode).toBe(200);
          // the notification is suposed to be the only one on the user in the unread array and its supposed to be populated
          // if a "messaging/ dueDate change" request was done that doesn't include a message, no new/second notification is expected
          expect(authResponseNotifiedUser.body.notifications).toEqual({
            read: [],
            unread: [
              {
                body: {
                  headline: `>bodo4< hat deine Anfrage zu >Item for ${testName}< angenommen`,
                  ...(itemInteractionBody.itemInteraction.message
                    ? {
                        text: itemInteractionBody.itemInteraction.message,
                      }
                    : {}),
                },
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                emailRequired: false,
                read: false,
                timeStamp: expect.any(String),
                item: itemId,
                interaction: interactionIdOnItem,
                __v: expect.any(Number),
              },
              itemInteractionBody.itemInteraction.dueDate
                ? {
                    body: {
                      headline: `Das Abgabedatum von >Item for ${testName}< wurde zu >${itemInteractionBody.itemInteraction.dueDate}< geändert`,
                    },
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    emailRequired: false,
                    read: false,
                    timeStamp: expect.any(String),
                    item: itemId,
                    interaction: interactionIdOnItem,
                    __v: expect.any(Number),
                  }
                : undefined,
            ],
          });
        };

        // test: create Item, open interaction, let bodo4 accept,
        // get bibis auth to check for notification, delete item and notifications
        const testForNotificationOnInterestedPartyForOwnerAcceptsOpenedItemInteraction =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(testName);

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              testName,
            );

            // bodo4 accepts ItemInteraction
            const handleItemInteractionResponseAcceptOnOpened =
              await bodo4SendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                itemInteractionBody,
              );

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // bibi calles auth
            const authResponseNotifiedUser = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4 = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all notifications
            const deleteAllOfUsersNotificationsResponse = await request(app)
              .delete(
                `${userRoute}/${bodo4sUserId}/${
                  userIdNotificationRoute.split(':userId/').slice(-1)[0]
                }`,
              )
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // logout
            await logout(connectSidValueBodo4);

            expectsForNotificationOnItemInteraction(
              itemId,
              interactionIdOnItem,
              validItemInteractionBody,
              authResponseNotifiedUser,
            );
          };

        const validItemInteractionBodyWithMessage = {
          itemInteraction: {
            status: 'accepted',
            message: `some message on opened interaction for ${testName}`,
          },
        };
        it('on interstedParty with a given message', async () => {
          await testForNotificationOnInterestedPartyForOwnerAcceptsOpenedItemInteraction(
            validItemInteractionBodyWithMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessage = {
          itemInteraction: {
            status: 'accepted',
            // message: `some message on opened interaction for ${testName}`,
          },
        };

        it('on interstedParty without given message', async () => {
          await testForNotificationOnInterestedPartyForOwnerAcceptsOpenedItemInteraction(
            validItemInteractionBodyWithNoMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithMessageAndDueDate = {
          itemInteraction: {
            status: 'accepted',
            message: `some message on opened interaction for ${testName}`,
            dueDate: getFutureDateForBody(7),
          },
        };
        it('on interestedParty with a given message and new dueDate notice', async () => {
          await testForNotificationOnInterestedPartyForOwnerAcceptsOpenedItemInteraction(
            validItemInteractionBodyWithMessageAndDueDate,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessageAndDueDate = {
          itemInteraction: {
            status: 'accepted',
            // message: `some message on opened interaction for ${testName}`,
            dueDate: getFutureDateForBody(7),
          },
        };

        it('on interstedParty without given message and new dueDate notice', async () => {
          await testForNotificationOnInterestedPartyForOwnerAcceptsOpenedItemInteraction(
            validItemInteractionBodyWithNoMessageAndDueDate,
          );
        }, 10000);
      });
    });
    describe('for current interactionStatus is accepted', () => {
      describe('for status accepted - requested by interestedParty - and set notification', () => {
        const testName =
          'testForNotificationOnOwnerForMessageingOnAcceptedItemInteraction';
        const expectsForNotificationOnItemInteraction = (
          itemId: string,
          interactionIdOnItem: string,
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          authResponseNotifiedUser: request.Response,
        ) => {
          // console.log(
          //   'authResponseNotifiedUser.body.notifications.unread',
          //   authResponseNotifiedUser.body.notifications.unread,
          // );

          // expects
          expect(authResponseNotifiedUser.statusCode).toBe(200);
          // the notifications are suposed to be the only ones on the user in the unread array and its supposed to be populated
          // if a "messaging" request was done that doen't include a message, no new/second notification is expected
          expect(authResponseNotifiedUser.body.notifications).toEqual({
            read: [],
            unread: [
              {
                body: {
                  headline: `>bibi< ist an >Item for ${testName}< interessiert`,
                  text: `opening interaction for ${testName}`,
                },
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                emailRequired: false,
                read: false,
                timeStamp: expect.any(String),
                item: itemId,
                interaction: interactionIdOnItem,
                __v: expect.any(Number),
              },
              itemInteractionBody.itemInteraction.message
                ? {
                    body: {
                      headline: `Neue Nachricht: >bibi< zu >Item for ${testName}<`,
                      ...(itemInteractionBody.itemInteraction.message
                        ? {
                            text: itemInteractionBody.itemInteraction.message,
                          }
                        : {}),
                    },
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    emailRequired: false,
                    read: false,
                    timeStamp: expect.any(String),
                    item: itemId,
                    interaction: interactionIdOnItem,
                    __v: expect.any(Number),
                  }
                : undefined,
            ],
          });
        };

        // test: create Item, open interaction, let bodo4 accept, have bibi send a message,
        // get bodo4s auth to check for notification, delete item and notifications

        const testForNotificationOnOwnerForMessageingOnAcceptedItemInteraction =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(testName);

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              testName,
            );

            // bodo4 accepts ItemInteraction
            const handleItemInteractionResponseAcceptOnOpened =
              await bodo4SendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                { itemInteraction: { status: 'accepted' } },
              );

            // bibi sends request to message on accepted
            const handleItemInteractionResponseAcceptOnAccepted =
              await bibiSendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                itemInteractionBody,
              );

            // login Bodo4
            const connectSidValueBodo4 = await loginBodo4();

            // bodo4 calles auth
            const authResponseNotifiedUser = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all notifications
            const deleteAllOfUsersNotificationsResponse = await request(app)
              .delete(
                `${userRoute}/${bodo4sUserId}/${
                  userIdNotificationRoute.split(':userId/').slice(-1)[0]
                }`,
              )
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // logout
            await logout(connectSidValueBodo4);

            expectsForNotificationOnItemInteraction(
              itemId,
              interactionIdOnItem,
              validItemInteractionBody,
              authResponseNotifiedUser,
            );
          };

        const validItemInteractionBodyWithMessage = {
          itemInteraction: {
            status: 'accepted',
            message: `some message on accepted interaction for ${testName}`,
          },
        };
        it('on owner with a given message', async () => {
          await testForNotificationOnOwnerForMessageingOnAcceptedItemInteraction(
            validItemInteractionBodyWithMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessage = {
          itemInteraction: {
            status: 'accepted',
            // message: `some message on accepted interaction for ${testName}`,
          },
        };

        it('NOT on owner without given message', async () => {
          await testForNotificationOnOwnerForMessageingOnAcceptedItemInteraction(
            validItemInteractionBodyWithNoMessage,
          );
        }, 10000);
      });
      describe('for status accepted - requested by owner - and set notification', () => {
        const testName =
          'testForNotificationOnInterestedPartyForMessagingOnAcceptedItemInteraction';
        const expectsForNotificationOnItemInteraction = (
          itemId: string,
          interactionIdOnItem: string,
          itemInteractionBody: { itemInteraction: ItemInteractionRequest },
          authResponseNotifiedUser: request.Response,
        ) => {
          // console.log(
          //   'authResponseNotifiedUser.body.notifications.unread',
          //   authResponseNotifiedUser.body.notifications.unread,
          // );

          // expects
          expect(authResponseNotifiedUser.statusCode).toBe(200);
          // the notification is suposed to be the only one on the user in the unread array and its supposed to be populated
          // if a "messaging/ dueDate change" request was done that doesn't include a message, no new/second notification is expected
          expect(authResponseNotifiedUser.body.notifications).toEqual({
            read: [],
            unread: [
              {
                body: {
                  headline: `>bodo4< hat deine Anfrage zu >Item for ${testName}< angenommen`,
                },
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                emailRequired: false,
                read: false,
                timeStamp: expect.any(String),
                item: itemId,
                interaction: interactionIdOnItem,
                __v: expect.any(Number),
              },
              itemInteractionBody.itemInteraction.message
                ? {
                    body: {
                      headline: `Neue Nachricht zu >Item for ${testName}<`,
                      ...(itemInteractionBody.itemInteraction.message
                        ? {
                            text: itemInteractionBody.itemInteraction.message,
                          }
                        : {}),
                    },
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    emailRequired: false,
                    read: false,
                    timeStamp: expect.any(String),
                    item: itemId,
                    interaction: interactionIdOnItem,
                    __v: expect.any(Number),
                  }
                : undefined,
              itemInteractionBody.itemInteraction.dueDate
                ? {
                    body: {
                      headline: `Das Abgabedatum von >Item for ${testName}< wurde zu >${itemInteractionBody.itemInteraction.dueDate}< geändert`,
                    },
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    emailRequired: false,
                    read: false,
                    timeStamp: expect.any(String),
                    item: itemId,
                    interaction: interactionIdOnItem,
                    __v: expect.any(Number),
                  }
                : undefined,
            ].filter(Boolean), //removes undefined elements from an array
          });
        };

        // test: create Item, open interaction, let bodo4 accept, have bodo4 send a message,
        // get bibis auth to check for notification, delete item and notifications
        const testForNotificationOnInterestedPartyForMessagingOnAcceptedItemInteraction =
          async (validItemInteractionBody: {
            itemInteraction: ItemInteractionRequest;
          }) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(testName);

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              testName,
            );

            // bodo4 accepts ItemInteraction
            const handleItemInteractionResponseAcceptOnOpened =
              await bodo4SendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                { itemInteraction: { status: 'accepted' } },
              );

            // bodo4 sends request to message on accepted / change dueDate
            const handleItemInteractionResponseAcceptOnAccepted =
              await bodo4SendsItemInteractionRequest(
                itemId,
                interactionIdOnItem,
                itemInteractionBody,
              );

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // bibi calles auth
            const authResponseNotifiedUser = await request(app)
              .get(authRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4 = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // delete all notifications
            const deleteAllOfUsersNotificationsResponse = await request(app)
              .delete(
                `${userRoute}/${bodo4sUserId}/${
                  userIdNotificationRoute.split(':userId/').slice(-1)[0]
                }`,
              )
              .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

            // logout
            await logout(connectSidValueBodo4);

            expectsForNotificationOnItemInteraction(
              itemId,
              interactionIdOnItem,
              validItemInteractionBody,
              authResponseNotifiedUser,
            );
          };

        const validItemInteractionBodyWithMessage = {
          itemInteraction: {
            status: 'accepted',
            message: `some message on accepted interaction for ${testName}`,
          },
        };
        it('on interstedParty with a given message', async () => {
          await testForNotificationOnInterestedPartyForMessagingOnAcceptedItemInteraction(
            validItemInteractionBodyWithMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessage = {
          itemInteraction: {
            status: 'accepted',
            // message: `some message on accepted interaction for ${testName}`,
          },
        };

        it('NOT on interstedParty without given message', async () => {
          await testForNotificationOnInterestedPartyForMessagingOnAcceptedItemInteraction(
            validItemInteractionBodyWithNoMessage,
          );
        }, 10000);

        const validItemInteractionBodyWithMessageAndDueDate = {
          itemInteraction: {
            status: 'accepted',
            message: `some message on accepted interaction for ${testName}`,
            dueDate: getFutureDateForBody(7),
          },
        };
        it('on interestedParty with a given message and new dueDate notice', async () => {
          await testForNotificationOnInterestedPartyForMessagingOnAcceptedItemInteraction(
            validItemInteractionBodyWithMessageAndDueDate,
          );
        }, 10000);

        const validItemInteractionBodyWithNoMessageAndDueDate = {
          itemInteraction: {
            status: 'accepted',
            // message: `some message on accepted interaction for ${testName}`,
            dueDate: getFutureDateForBody(7),
          },
        };

        it('NOT on interstedParty without given message but new dueDate notice', async () => {
          await testForNotificationOnInterestedPartyForMessagingOnAcceptedItemInteraction(
            validItemInteractionBodyWithNoMessageAndDueDate,
          );
        }, 10000);
      });
    });
  });

  describe('DELETE all items', () => {
    it('should delete all of bodo4s items', async () => {
      // login bodo4
      const connectSidValue = await loginBodo4();
      // delete all items as bodo4
      const deleteAllOfUsersItemsResponse = await request(app)
        .delete(itemRoute)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);
      // delete all notifications
      const deleteAllOfUsersNotificationsResponse = await request(app)
        .delete(
          `${userRoute}/${bodo4sUserId}/${
            userIdNotificationRoute.split(':userId/').slice(-1)[0]
          }`,
        )
        .set('Cookie', [`connect.sid=${connectSidValue}`]);
      // logout bodo4
      await logout(connectSidValue);

      expect([
        'You had no items to delete.',
        'Successfully deleted all of your items!',
      ]).toEqual(expect.arrayContaining([deleteAllOfUsersItemsResponse.text]));

      expect(deleteAllOfUsersNotificationsResponse.text).toEqual(
        'successfully removed all of users and all orphaned notifications',
      );

      console.log('all tests in notifications.test.ts ran');
    }, 10000);
  });
});
