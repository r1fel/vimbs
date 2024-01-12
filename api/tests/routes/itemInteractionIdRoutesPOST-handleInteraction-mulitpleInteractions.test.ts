import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';

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

const getFutureDateForBody = (weeks = 2): string => {
  const futureDate = getFutureDate(weeks);

  // Formatting the date to 'YYYY-MM-DD'
  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  const day = String(futureDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// const bodo4CreatesItem = async (testName: string) => {
//   // login Bodo4, let him create Item with passed in Body
//   const connectSidValueBodo4First = await loginBodo4();

//   // create item
//   const createItemResponse = await request(app)
//     .post(itemRoute)
//     .send({
//       item: {
//         name: `Item for ${testName}`,
//         categories: { Other: { subcategories: ['Sonstiges'] } },
//       },
//     })
//     .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
//   // extract itemId
//   const itemId = createItemResponse.body[0]._id;

//   // logout
//   await logout(connectSidValueBodo4First);

//   return itemId;
// };

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
      // current interactionStatus is acceped tested in itemInteractionIdRoutesPOST-handleInteraction-accepedInteractions.test.ts
      // current interactionStatus is declined tested in itemInteractionIdRoutesPOST-handleInteraction-declinedInteractions.test.ts
      // current interactionStatus is closed tested in itemInteractionIdRoutesPOST-handleInteraction-closedInteractions.test.ts
      describe('mulitple interactions on one item', () => {
        // expect statements for all tests in this block
        const expectsForMultipleInteractions = (
          itemId: string,
          getShowItemForBob: request.Response, //TestAnswerA
          authResponseBobBeforeDecline: request.Response, //TestAnswerB
          authResponseBobAfterDecline: request.Response, //TestAnswerC
          closedMessagingItemInteractionResponseForFirstInArray: request.Response, //TestAnswerD
          openedMessagingItemInteractionResponseForThirdInArray: request.Response, //TestAnswerE
          closedMessagingBackItemInteractionResponseForFirstInArray: request.Response, //TestAnswerF
          openedMessagingBackItemInteractionResponseForThirdInArray: request.Response, //TestAnswerG
          acceptMessagingItemInteractionResponseForThirdInArray: request.Response, //TestAnswerH
          acceptedMessagingBackItemInteractionResponseForThirdInArray: request.Response, //TestAnswerI
          declinedMessagingItemInteractionResponseForSecondInArray: request.Response, //TestAnswerJ
          declinedMessagingBackItemInteractionResponseForSecondInArray: request.Response, //TestAnswerK
          authResponseBibiEnd: request.Response, //TestAnswerL
          authResponseBobEnd: request.Response, //TestAnswerM
          authResponseBibiAfterSecondOpenInteraction: request.Response, //TestAnswerN
          authResponseBibiAfterSecondInteractionWasClosed: request.Response, //TestAnswerO
        ) => {
          // (A) test, that bob doesn't see owner data or interaction
          // console.log('getShowItemForBob.body', getShowItemForBob.body);
          // expects A getShowItemForBob
          expect(getShowItemForBob.statusCode).toBe(200);
          // expect the body array to only have one object inside
          expect(getShowItemForBob.body).toHaveLength(1);
          // expect interactions to be null
          expect(getShowItemForBob.body[0].interactions).toBeNull();
          // expect ownerData to be null
          expect(getShowItemForBob.body[0].ownerData).toBeNull();
          // expect item to be available
          expect(getShowItemForBob.body[0].available).toBeTruthy();

          // (B) test, that bob has itemId only in getItems
          // console.log(
          //   'authResponseBobBeforeDecline.body',
          //   authResponseBobBeforeDecline.body,
          // );
          // expects B authResponseBobBeforeDecline
          expect(authResponseBobBeforeDecline.statusCode).toBe(200);
          //  itemId is only supposed to be in getItems - exactly once
          expect(authResponseBobBeforeDecline.body.myItems).not.toContain(
            itemId,
          );
          expect(authResponseBobBeforeDecline.body.getItems).toContain(itemId);
          expect(authResponseBobBeforeDecline.body.getHistory).not.toContain(
            itemId,
          );
          expect(
            authResponseBobBeforeDecline.body.getItems.filter(
              (item: any) => item === itemId,
            ),
          ).toHaveLength(1);

          // (C) test, that bob has itemId only in getHistory
          // console.log(
          //   'authResponseBobAfterDecline.body',
          //   authResponseBobAfterDecline.body,
          // );
          // expects C authResponseBobAfterDecline
          expect(authResponseBobAfterDecline.statusCode).toBe(200);
          //  itemId is only supposed to be in getHistory - exactly once
          expect(authResponseBobAfterDecline.body.myItems).not.toContain(
            itemId,
          );
          expect(authResponseBobAfterDecline.body.getItems).not.toContain(
            itemId,
          );
          expect(authResponseBobAfterDecline.body.getHistory).toContain(itemId);
          expect(
            authResponseBobAfterDecline.body.getHistory.filter(
              (item: any) => item === itemId,
            ),
          ).toHaveLength(1);

          // (D) test, that bibi gets ownerData and message is pushed
          // console.log(
          //   'closedMessagingItemInteractionResponseForFirstInArray.body[0].interactions',
          //   closedMessagingItemInteractionResponseForFirstInArray.body[0]
          //     .interactions,
          // );
          // expects D closedMessagingItemInteractionResponseForFirstInArray
          expect(
            closedMessagingItemInteractionResponseForFirstInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            closedMessagingItemInteractionResponseForFirstInArray.body,
          ).toHaveLength(1);
          // expect item to be available
          expect(
            closedMessagingItemInteractionResponseForFirstInArray.body[0]
              .available,
          ).toBeTruthy();
          // expect interactions of items to have one interaction inside
          expect(
            closedMessagingItemInteractionResponseForFirstInArray.body[0]
              .interactions,
          ).toHaveLength(1);
          // expect last message to be pushed to messagelog
          expect(
            closedMessagingItemInteractionResponseForFirstInArray.body[0]
              .interactions[0].messagelog,
          ).toHaveLength(4); // open, accept, close, message
          expect(
            closedMessagingItemInteractionResponseForFirstInArray.body[0]
              .interactions[0].messagelog[3],
          ).toStrictEqual({
            messageText:
              'messaging on closed interaction 1 for testForMultipleInteractions',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              openedMessagingItemInteractionResponseForThirdInArray.body[0].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(2)); // default of opening, since bibi didn't give a value for opening
          // expect ownerData to be given
          expect(
            closedMessagingItemInteractionResponseForFirstInArray.body[0]
              .ownerData,
          ).toStrictEqual({
            _id: expect.any(String),
            name: 'bodo4 The Big',
            email: 'bodo4@gmail.com',
            picture: noProfilePicture,
            phone: '+4917298086213',
          });

          // (E) test, that bibi gets owenerData, gets both interactions and message was pushed
          // console.log(
          //   'openedMessagingItemInteractionResponseForThirdInArray.body[0].interactions',
          //   openedMessagingItemInteractionResponseForThirdInArray.body[0]
          //     .interactions,
          // );
          // expects E openedMessagingItemInteractionResponseForThirdInArray
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body,
          ).toHaveLength(1);
          // expect item not to be available
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body[0]
              .available,
          ).toBeFalsy();
          // expect interactions of items to have two interaction inside
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions,
          ).toHaveLength(2);
          // expect last message to be pushed to messagelog
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions[1].messagelog,
          ).toHaveLength(2); // open, open messaging
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions[1].messagelog[1],
          ).toStrictEqual({
            messageText:
              'messaging on opened interaction 3 for testForMultipleInteractions',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              openedMessagingItemInteractionResponseForThirdInArray.body[0].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(2)); // default of opening, since bibi didn't give a value for opening
          // expect revealOwnerIdentity to be true
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions[0].revealOwnerIdentity,
          ).toBeTruthy();
          // expect revealOwnerIdentity to be true
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions[1].revealOwnerIdentity,
          ).toBeFalsy();
          // expect ownerData to be given
          expect(
            openedMessagingItemInteractionResponseForThirdInArray.body[0]
              .ownerData,
          ).toStrictEqual({
            _id: expect.any(String),
            name: 'bodo4 The Big',
            email: 'bodo4@gmail.com',
            picture: noProfilePicture,
            phone: '+4917298086213',
          });

          // (N) test, that bibi has itemId in getHistory and in getItems
          // console.log(
          //   'authResponseBibiAfterSecondOpenInteraction.body',
          //   authResponseBibiAfterSecondOpenInteraction.body,
          // );
          // expects N authResponseBibiAfterSecondOpenInteraction
          expect(authResponseBibiAfterSecondOpenInteraction.statusCode).toBe(
            200,
          );
          //  itemId is supposed to be in getHistory and in getItems - each exactly once
          expect(
            authResponseBibiAfterSecondOpenInteraction.body.myItems,
          ).not.toContain(itemId);
          expect(
            authResponseBibiAfterSecondOpenInteraction.body.getItems,
          ).toContain(itemId);
          expect(
            authResponseBibiAfterSecondOpenInteraction.body.getItems.filter(
              (item: any) => item === itemId,
            ),
          ).toHaveLength(1);
          expect(
            authResponseBibiAfterSecondOpenInteraction.body.getHistory,
          ).toContain(itemId);
          expect(
            authResponseBibiAfterSecondOpenInteraction.body.getHistory.filter(
              (item: any) => item === itemId,
            ),
          ).toHaveLength(1);

          // (F) test, that bodo gets all 3 interaction, can answer on closed and no changes are made to dueDate
          // console.log(
          //   'closedMessagingBackItemInteractionResponseForFirstInArray.body[0].interactions',
          //   closedMessagingBackItemInteractionResponseForFirstInArray.body[0]
          //     .interactions,
          // );
          // expects F closedMessagingBackItemInteractionResponseForFirstInArray
          expect(
            closedMessagingBackItemInteractionResponseForFirstInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            closedMessagingBackItemInteractionResponseForFirstInArray.body,
          ).toHaveLength(1);
          // expect item not to be available
          expect(
            closedMessagingBackItemInteractionResponseForFirstInArray.body[0]
              .available,
          ).toBeFalsy();
          // expect interactions of items to have three interaction inside (bodo sees them all)
          expect(
            closedMessagingBackItemInteractionResponseForFirstInArray.body[0]
              .interactions,
          ).toHaveLength(3);
          // expect message to be pushed to messagelog of the first interaction
          expect(
            closedMessagingBackItemInteractionResponseForFirstInArray.body[0]
              .interactions[0].messagelog,
          ).toHaveLength(5); // open, accept, close, message, message back
          expect(
            closedMessagingBackItemInteractionResponseForFirstInArray.body[0]
              .interactions[0].messagelog[4],
          ).toStrictEqual({
            messageText:
              'messaging back on closed interaction 1 for testForMultipleInteractions',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              closedMessagingBackItemInteractionResponseForFirstInArray.body[0].interactions[0].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(6 / 7)); // set by bodo upon accepting

          // (G) test, that bodo can answer on opened
          // console.log(
          //   'openedMessagingBackItemInteractionResponseForThirdInArray.body[0].interactions',
          //   openedMessagingBackItemInteractionResponseForThirdInArray.body[0]
          //     .interactions,
          // );
          // expects G openedMessagingBackItemInteractionResponseForThirdInArray
          expect(
            openedMessagingBackItemInteractionResponseForThirdInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            openedMessagingBackItemInteractionResponseForThirdInArray.body,
          ).toHaveLength(1);
          // expect item not to be available
          expect(
            openedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .available,
          ).toBeFalsy();
          // expect interactions of items to have three interaction inside (bodo sees them all)
          expect(
            openedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .interactions,
          ).toHaveLength(3);
          // expect message to be pushed to messagelog of the third interaction
          expect(
            openedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .interactions[2].messagelog,
          ).toHaveLength(3); // open, message, message back
          expect(
            openedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .interactions[2].messagelog[2],
          ).toStrictEqual({
            messageText:
              'messaging back on opened interaction 3 for testForMultipleInteractions',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              openedMessagingBackItemInteractionResponseForThirdInArray.body[0].interactions[2].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(2)); // default of opening, since bibi didn't give a value for opening

          // (H) test, that bodo can answer on accepted
          // console.log(
          //   'acceptMessagingItemInteractionResponseForThirdInArray.body[0].interactions',
          //   acceptMessagingItemInteractionResponseForThirdInArray.body[0]
          //     .interactions,
          // );
          // expects H acceptMessagingItemInteractionResponseForThirdInArray
          expect(
            acceptMessagingItemInteractionResponseForThirdInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            acceptMessagingItemInteractionResponseForThirdInArray.body,
          ).toHaveLength(1);
          // expect item not to be available
          expect(
            acceptMessagingItemInteractionResponseForThirdInArray.body[0]
              .available,
          ).toBeFalsy();
          // expect interactions of items to have three interaction inside (bodo sees them all)
          expect(
            acceptMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions,
          ).toHaveLength(3);
          // expect message to be pushed to messagelog of the third interaction
          expect(
            acceptMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions[0].messagelog,
          ).toHaveLength(5); // open, message, message back, accept, message
          expect(
            acceptMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions[2].messagelog[3],
          ).toStrictEqual({
            messageText: 'accept interaction 3 for testForMultipleInteractions',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            acceptMessagingItemInteractionResponseForThirdInArray.body[0]
              .interactions[2].messagelog[4],
          ).toStrictEqual({
            messageText:
              'messaging on accepted interaction 3 for testForMultipleInteractions',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              acceptMessagingItemInteractionResponseForThirdInArray.body[0].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(15 / 7)); // what bodo4 sets by messaging on accepting the interaction with new dueDate

          // (I) test, that bibi can answer on accepted
          // console.log(
          //   'acceptedMessagingBackItemInteractionResponseForThirdInArray.body[0].interactions',
          //   acceptedMessagingBackItemInteractionResponseForThirdInArray.body[0]
          //     .interactions,
          // );
          // expects I acceptedMessagingBackItemInteractionResponseForThirdInArray
          expect(
            acceptedMessagingBackItemInteractionResponseForThirdInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            acceptedMessagingBackItemInteractionResponseForThirdInArray.body,
          ).toHaveLength(1);
          // expect item not to be available
          expect(
            acceptedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .available,
          ).toBeFalsy();
          // expect interactions of items to have two interaction inside
          expect(
            acceptedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .interactions,
          ).toHaveLength(2);
          // expect last message to be pushed to messagelog
          expect(
            acceptedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .interactions[1].messagelog,
          ).toHaveLength(6); // open, open messaging, open message back, accept, accept message, accept message back
          expect(
            acceptedMessagingBackItemInteractionResponseForThirdInArray.body[0]
              .interactions[1].messagelog[5],
          ).toStrictEqual({
            messageText:
              'messaging back on accepted interaction 3 for testForMultipleInteractions',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              acceptedMessagingBackItemInteractionResponseForThirdInArray.body[0].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(15 / 7)); // what bodo4 sets by messaging on accepting the interaction with new dueDate

          // (J) test, that bodo can answer on declined and no changes are made to dueDate
          // console.log(
          //   'declinedMessagingItemInteractionResponseForSecondInArray.body[0].interactions',
          //   declinedMessagingItemInteractionResponseForSecondInArray.body[0]
          //     .interactions,
          // );
          // expects J declinedMessagingItemInteractionResponseForSecondInArray
          expect(
            declinedMessagingItemInteractionResponseForSecondInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            declinedMessagingItemInteractionResponseForSecondInArray.body,
          ).toHaveLength(1);
          // expect item to be available
          expect(
            declinedMessagingItemInteractionResponseForSecondInArray.body[0]
              .available,
          ).toBeTruthy();
          // expect interactions of items to have three interaction inside (bodo sees them all)
          expect(
            declinedMessagingItemInteractionResponseForSecondInArray.body[0]
              .interactions,
          ).toHaveLength(3);
          // expect last message to be pushed to messagelog
          expect(
            declinedMessagingItemInteractionResponseForSecondInArray.body[0]
              .interactions[1].messagelog,
          ).toHaveLength(3); // open, decline, message on decline
          expect(
            declinedMessagingItemInteractionResponseForSecondInArray.body[0]
              .interactions[1].messagelog[2],
          ).toStrictEqual({
            messageText:
              'messaging on declined interaction 2 for testForMultipleInteractions',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              declinedMessagingItemInteractionResponseForSecondInArray.body[0].interactions[1].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(0)); // default dueDate is set to today for declining

          // (O) test, that bibi has itemId only once in getHistory
          // console.log(
          //   'authResponseBibiAfterSecondInteractionWasClosed.body',
          //   authResponseBibiAfterSecondInteractionWasClosed.body,
          // );
          // expects O authResponseBibiAfterSecondInteractionWasClosed
          expect(
            authResponseBibiAfterSecondInteractionWasClosed.statusCode,
          ).toBe(200);
          //  itemId is supposed to be in getHistory - exactly once
          expect(
            authResponseBibiAfterSecondInteractionWasClosed.body.myItems,
          ).not.toContain(itemId);
          expect(
            authResponseBibiAfterSecondInteractionWasClosed.body.getItems,
          ).not.toContain(itemId);
          expect(
            authResponseBibiAfterSecondInteractionWasClosed.body.getHistory,
          ).toContain(itemId);
          expect(
            authResponseBibiAfterSecondInteractionWasClosed.body.getHistory.filter(
              (item: any) => item === itemId,
            ),
          ).toHaveLength(1);

          // (K) test, that bob can answer on declined
          // console.log(
          //   'declinedMessagingBackItemInteractionResponseForSecondInArray.body[0].interactions',
          //   declinedMessagingBackItemInteractionResponseForSecondInArray.body[0]
          //     .interactions,
          // );
          // expects K declinedMessagingBackItemInteractionResponseForSecondInArray
          expect(
            declinedMessagingBackItemInteractionResponseForSecondInArray.statusCode,
          ).toBe(200);
          // expect the body array to only have one object inside
          expect(
            declinedMessagingBackItemInteractionResponseForSecondInArray.body,
          ).toHaveLength(1);
          // expect item to be available
          expect(
            declinedMessagingBackItemInteractionResponseForSecondInArray.body[0]
              .available,
          ).toBeTruthy();
          // expect interactions of items to have one interaction inside
          expect(
            declinedMessagingBackItemInteractionResponseForSecondInArray.body[0]
              .interactions,
          ).toHaveLength(1);
          // expect last message to be pushed to messagelog
          expect(
            declinedMessagingBackItemInteractionResponseForSecondInArray.body[0]
              .interactions[0].messagelog,
          ).toHaveLength(4); //  open, decline, message on decline, message back
          expect(
            declinedMessagingBackItemInteractionResponseForSecondInArray.body[0]
              .interactions[0].messagelog[3],
          ).toStrictEqual({
            messageText:
              'messaging back on declined interaction 2 for testForMultipleInteractions',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          });
          expect(
            new Date(
              declinedMessagingBackItemInteractionResponseForSecondInArray.body[0].interactions[0].dueDate,
            )
              .toISOString()
              .split('T')[0],
          ).toEqual(getFutureDateForBody(0)); // default dueDate is set to today for declining
          // expect ownerData to be null
          expect(
            declinedMessagingBackItemInteractionResponseForSecondInArray.body[0]
              .ownerData,
          ).toBeNull();

          // (L) test, that bibi has the itemId nowhere
          // console.log('authResponseBibiEnd.body', authResponseBibiEnd.body);
          // expects L authResponseBibiEnd
          expect(authResponseBibiEnd.statusCode).toBe(200);
          //  itemId is not supposed to be in any array since the item was deleted
          expect(authResponseBibiEnd.body.myItems).not.toContain(itemId);
          expect(authResponseBibiEnd.body.getItems).not.toContain(itemId);
          expect(authResponseBibiEnd.body.getHistory).not.toContain(itemId);

          // (M) test, that bob has the itemId nowhere
          // console.log('authResponseBobEnd.body', authResponseBobEnd.body);
          // expects M authResponseBobEnd
          expect(authResponseBobEnd.statusCode).toBe(200);
          //  itemId is not supposed to be in any array since the item was deleted
          expect(authResponseBobEnd.body.myItems).not.toContain(itemId);
          expect(authResponseBobEnd.body.getItems).not.toContain(itemId);
          expect(authResponseBobEnd.body.getHistory).not.toContain(itemId);
        };

        // test: bodo creates item (itemId), bibi opens interaction (interactionIdOnItemBibi1),
        // login bodo, accept interaction, close interaction, logout bodo
        // login bob, getShowItem (A), open interaction (interactionIdOnItemBob), get auth (B), decline interaction, get auth (C), logout bob
        // login bibi, write message on closed interaction (D), open new interaction (interactionIdOnItemBibi2), write message on opened interaction (E), get auth (N), logout bibi
        // login bodo, write message on closed (F), write message on opened (G), accept interaction, write message on accepted (H), logout bodo
        // login bibi, write message on accepted (I), logout bibi
        // login bodo, close interaction, write message on declined interaction (J), logout bodo
        // login bibi, get auth (O), logout bibi
        // login bob, write message on declined interaction (K), logout bob
        // login bodo, delete Items, logout bodo
        // login bibi, get auth (L), logout bibi
        // login bob, get auth (M), logout bob

        //
        // (A) test, that bob doesn't see owner data or interaction
        // (B) test, that bob has itemId only in getItems
        // (C) test, that bob has itemId only in getHistory
        // (D) test, that bibi gets ownerData and message is pushed
        // (E) test, that bibi gets owenerData, gets both interactions and message was pushed
        // (N) test, that bibi has itemId in getHistory and in getItems
        // (F) test, that bodo gets all 3 interaction, can answer on closed and no changes are made to dueDate
        // (G) test, that bodo can answer on opened
        // (H) test, that bodo can answer on accepted
        // (I) test, that bibi can answer on accepted
        // (J) test, that bodo can answer on declined and no changes are made to dueDate
        // (O) test, that bibi has itemId only once in getHistory
        // (K) test, that bob can answer on declined
        // (L) test, that bibi has the itemId nowhere
        // (M) test, that bob has the itemId nowhere

        const testForMultipleInteractions = async () => {
          // bodo4 creates item
          const itemId = await bodo4CreatesItem('testForMultipleInteractions');

          // bibi opens interaction
          const interactionIdOnItemBibi1 = await bibiOpensInteraction(
            itemId,
            'testForMultipleInteractions',
          );

          // login Bodo4
          const connectSidValueBodo4Second = await loginBodo4();

          // bodo4 accepts interaction
          const handleItemInteractionResponseAccepting = await request(app)
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }/${interactionIdOnItemBibi1}`,
            )
            .send({
              itemInteraction: {
                status: 'accepted',
                message:
                  'accepting interaction for testForMultipleInteractions',
                dueDate: getFutureDateForBody(6 / 7), //test this date to stay set even later
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

          // bodo4 closes interaction
          const handleItemInteractionResponseClosing = await request(app)
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }/${interactionIdOnItemBibi1}`,
            )
            .send({
              itemInteraction: {
                status: 'closed',
                message: 'closing interaction for testForMultipleInteractions',
                dueDate: getFutureDateForBody(3),
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

          // logout bodo
          await logout(connectSidValueBodo4Second);

          // login bob
          const connectSidValueBobFirst = await loginUser(
            'bob@gmail.com',
            'bob',
          );

          // TestAnswerA get showItem
          const getShowItemForBob = await request(app)
            .get(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValueBobFirst}`]);

          // bob opens an interaction
          const openItemInteractionResponseForSecondInArray = await request(app)
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }`,
            )
            .send({
              itemInteraction: {
                status: 'opened',
                message:
                  'opening interaction 2 for testForMultipleInteractions',
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBobFirst}`]);
          if (openItemInteractionResponseForSecondInArray.status !== 200)
            console.log(
              'openItemInteractionResponseForSecondInArray.text',
              openItemInteractionResponseForSecondInArray.text,
            );
          // extract interactionId
          const interactionIdOnItemBob =
            openItemInteractionResponseForSecondInArray.body[0].interactions[0]
              ._id;

          // TestAnswerB bob calles auth
          const authResponseBobBeforeDecline = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBobFirst}`]);

          // bob declines interaction
          const declineItemInteractionResponseForSecondInArray = await request(
            app,
          )
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }/${interactionIdOnItemBob}`,
            )
            .send({
              itemInteraction: {
                status: 'declined',
                message:
                  'declining interaction 2 for testForMultipleInteractions',
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBobFirst}`]);

          // TestAnswerC bob calles auth
          const authResponseBobAfterDecline = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBobFirst}`]);

          // logout bob
          await logout(connectSidValueBobFirst);

          // login bibi
          const connectSidValueBibiSecond = await loginUser(
            'bibi@gmail.com',
            'bibi',
          );

          // TestAnswerD bibi wirtes message on closed interaction
          const closedMessagingItemInteractionResponseForFirstInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBibi1}`,
              )
              .send({
                itemInteraction: {
                  status: 'closed',
                  message:
                    'messaging on closed interaction 1 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(3 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);

          // bibi opens second interaction
          const openItemInteractionResponseForThirdInArray = await request(app)
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }`,
            )
            .send({
              itemInteraction: {
                status: 'opened',
                message:
                  'opening interaction 3 for testForMultipleInteractions',
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);

          if (openItemInteractionResponseForThirdInArray.status !== 200)
            console.log(
              'openItemInteractionResponseForThirdInArray.text',
              openItemInteractionResponseForThirdInArray.text,
            );

          // extract interactionId
          const interactionIdOnItemBibi2 =
            openItemInteractionResponseForThirdInArray.body[0].interactions[0]
              ._id;

          // TestAnswerE bibi wirtes message on just opened interaction
          const openedMessagingItemInteractionResponseForThirdInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBibi2}`,
              )
              .send({
                itemInteraction: {
                  status: 'opened',
                  message:
                    'messaging on opened interaction 3 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(3 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);

          // TestAnswerN bibi calles auth
          const authResponseBibiAfterSecondOpenInteraction = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);

          // logout bibi
          await logout(connectSidValueBibiSecond);

          // login Bodo4
          const connectSidValueBodo4Third = await loginBodo4();

          // TestAnswerF bodo replies to bibis message on closed interaction
          const closedMessagingBackItemInteractionResponseForFirstInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBibi1}`,
              )
              .send({
                itemInteraction: {
                  status: 'closed',
                  message:
                    'messaging back on closed interaction 1 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(3 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

          // TestAnswerG bodo replies to bibis message on opened interaction
          const openedMessagingBackItemInteractionResponseForThirdInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBibi2}`,
              )
              .send({
                itemInteraction: {
                  status: 'opened',
                  message:
                    'messaging back on opened interaction 3 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(3 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

          // bodo accepts bibis second interaction
          const acceptItemInteractionResponseForThirdInArray = await request(
            app,
          )
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }/${interactionIdOnItemBibi2}`,
            )
            .send({
              itemInteraction: {
                status: 'accepted',
                message: 'accept interaction 3 for testForMultipleInteractions',
                dueDate: getFutureDateForBody(6 / 7),
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

          // TestAnswerH bodo accepts bibis second interaction
          const acceptMessagingItemInteractionResponseForThirdInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBibi2}`,
              )
              .send({
                itemInteraction: {
                  status: 'accepted',
                  message:
                    'messaging on accepted interaction 3 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(15 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

          // logout
          await logout(connectSidValueBodo4Third);

          // login bibi
          const connectSidValueBibiThird = await loginUser(
            'bibi@gmail.com',
            'bibi',
          );

          // TestAnswerI bibi wirtes message on accepted interaction
          const acceptedMessagingBackItemInteractionResponseForThirdInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBibi2}`,
              )
              .send({
                itemInteraction: {
                  status: 'accepted',
                  message:
                    'messaging back on accepted interaction 3 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(3 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibiThird}`]);

          // logout bibi
          await logout(connectSidValueBibiThird);

          // login Bodo4
          const connectSidValueBodo4Forth = await loginBodo4();

          // bodo closes interaction
          const closedItemInteractionResponseForThirdInArray = await request(
            app,
          )
            .post(
              `${itemRoute}/${itemId}/${
                itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
              }/${interactionIdOnItemBibi2}`,
            )
            .send({
              itemInteraction: {
                status: 'closed',
                message:
                  'closing interaction 3 for testForMultipleInteractions',
                dueDate: getFutureDateForBody(3 / 7),
              },
            })
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Forth}`]);

          // TestAnswerJ bodo writes message on declined interaction
          const declinedMessagingItemInteractionResponseForSecondInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBob}`,
              )
              .send({
                itemInteraction: {
                  status: 'declined',
                  message:
                    'messaging on declined interaction 2 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(3 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Forth}`]);

          // logout
          await logout(connectSidValueBodo4Forth);

          // login bibi
          const connectSidValueBibiForth = await loginUser(
            'bibi@gmail.com',
            'bibi',
          );

          // TestAnswerO bibi calles auth
          const authResponseBibiAfterSecondInteractionWasClosed = await request(
            app,
          )
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBibiForth}`]);

          // logout bibi
          await logout(connectSidValueBibiForth);

          // login bob
          const connectSidValueBobSecond = await loginUser(
            'bob@gmail.com',
            'bob',
          );

          // TestAnswerK bob declines interaction
          const declinedMessagingBackItemInteractionResponseForSecondInArray =
            await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItemBob}`,
              )
              .send({
                itemInteraction: {
                  status: 'declined',
                  message:
                    'messaging back on declined interaction 2 for testForMultipleInteractions',
                  dueDate: getFutureDateForBody(3 / 7),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBobSecond}`]);

          // logout bob
          await logout(connectSidValueBobSecond);

          // login Bodo4
          const connectSidValueBodo4Fifth = await loginBodo4();

          // delete all items
          const deleteAllOfUsersItemsResponse = await request(app)
            .delete(itemRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Fifth}`]);

          // logout
          await logout(connectSidValueBodo4Fifth);

          // login bibi
          const connectSidValueBibiFifth = await loginUser(
            'bibi@gmail.com',
            'bibi',
          );

          // TestAnswerL bibi calles auth
          const authResponseBibiEnd = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBibiFifth}`]);

          // logout
          await logout(connectSidValueBibiFifth);

          // login bob
          const connectSidValueBobThird = await loginUser(
            'bob@gmail.com',
            'bob',
          );

          // TestAnswerM bob calles auth
          const authResponseBobEnd = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBobThird}`]);

          // logout
          await logout(connectSidValueBobThird);

          expectsForMultipleInteractions(
            itemId,
            getShowItemForBob,
            authResponseBobBeforeDecline,
            authResponseBobAfterDecline,
            closedMessagingItemInteractionResponseForFirstInArray,
            openedMessagingItemInteractionResponseForThirdInArray,
            closedMessagingBackItemInteractionResponseForFirstInArray,
            openedMessagingBackItemInteractionResponseForThirdInArray,
            acceptMessagingItemInteractionResponseForThirdInArray,
            acceptedMessagingBackItemInteractionResponseForThirdInArray,
            declinedMessagingItemInteractionResponseForSecondInArray,
            declinedMessagingBackItemInteractionResponseForSecondInArray,
            authResponseBibiEnd,
            authResponseBobEnd,
            authResponseBibiAfterSecondOpenInteraction,
            authResponseBibiAfterSecondInteractionWasClosed,
          );
        };

        it('to check correct use of revealOwnerIdentiy and much more', async () => {
          await testForMultipleInteractions();
        }, 30000);
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
