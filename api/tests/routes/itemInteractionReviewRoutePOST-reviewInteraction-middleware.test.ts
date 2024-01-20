import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  itemRoute,
  itemIdInteractionRoute,
  itemIdInteractionIdReviewRoute,
} from './utilsForRoutes';

// string definitions
import { itemInteractionStatuses } from '../../src/utils/itemInteractionStringDefinitons';

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
      // console.log(`itemId attempt ${attempt}`, itemId);
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
      // console.log(
      //   `interactionIdOnItem attempt ${attempt}`,
      //   interactionIdOnItem,
      // );
      break;
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // logout bibi
  await logout(connectSidValueBibi);

  return interactionIdOnItem;
};

const bodo4AcceptsAndClosesInteraction = async (
  itemId: string,
  interactionId: string,
  testName: string,
) => {
  // login bodo4
  const connectSidValueBodo4 = await loginBodo4();

  // console.log('itemId in accept/close', itemId);
  // bodo4 accepts the interaction
  const acceptItemInteractionResponse = await request(app)
    .post(
      `${itemRoute}/${itemId}/${
        itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
      }/${interactionId}`,
    )
    .send({
      itemInteraction: {
        status: 'accepted',
        message: `accepting interaction for ${testName}`,
      },
    })
    .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);
  // if (acceptItemInteractionResponse.status === 200) {
  //   console.log('interaction accepted');
  // } else {
  //   console.log(
  //     'interaction accepted error',
  //     acceptItemInteractionResponse.text,
  //   );
  // }

  // bodo4 closes the interaction
  const closeItemInteractionResponse = await request(app)
    .post(
      `${itemRoute}/${itemId}/${
        itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
      }/${interactionId}`,
    )
    .send({
      itemInteraction: {
        status: 'closed',
        message: `closeing interaction for ${testName}`,
      },
    })
    .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);
  // if (closeItemInteractionResponse.status === 200) {
  //   console.log('interaction closed');
  // } else {
  //   console.log('interaction closed error', closeItemInteractionResponse.text);
  // }

  // logout bodo4
  await logout(connectSidValueBodo4);
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

const notPassedItemInteractionBelongsToItem = (
  httpVerb: string,
  routeBase: string,
  routeCenter: string,
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
            `${routeBase}/${invalidItemIdOfCorrectPattern}/${routeCenter}/${invalidInteractionIdOfCorrectPattern}/${routeEnd}`,
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
              `${routeBase}/${invalidId}/${routeCenter}/${invalidInteractionIdOfCorrectPattern}/${routeEnd}`,
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
            `${routeBase}/${itemId}/${routeCenter}/${invalidInteractionIdOfCorrectPattern}/${routeEnd}`,
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
            [httpVerb](
              `${routeBase}/${itemId}/${routeCenter}/${invalidId}/${routeEnd}`,
            )
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
            `${routeBase}/${itemId1}/${routeCenter}/${interactionIdOnItem2}/${routeEnd}`,
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
  routeCenter: string,
  routeEnd: string,
) => {
  describe('when isInteractionPartaker was not passed', () => {
    describe('when the user is neither item.owner nor interaction.interestedParty', () => {
      it('should respond error with a statusCode403', async () => {
        // bodo4 creates an item on which bibi opens a request
        // check if middleware throws an error when bob tries to access /item/bobsItem/itemInteraction/bibisInteraction/review

        // bodo4 creates item
        const itemId = await bodo4CreatesItem(
          'testing isInteractionPartaker middleware',
        );

        // bibi opens interaction
        const interactionIdOnItem = await bibiOpensInteraction(
          itemId,
          'testing isInteractionPartaker middleware',
        );

        // login bob
        const connectSidValueBob = await loginUser('bob@gmail.com', 'bob');

        // try route in question using the correct pairing of Ids, but beeing neither item.owner nor interaction.interestedParty
        const itemInteractionIdResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeCenter}/${interactionIdOnItem}/${routeEnd}`,
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

        // console.log(
        //   'expect 403:',
        //   itemInteractionIdResponse.statusCode,
        //   itemInteractionIdResponse.text,
        // );
        // expect route in question to throw 403
        expect(itemInteractionIdResponse.statusCode).toBe(403);
        expect(itemInteractionIdResponse.text).toContain(
          'Error: Forbidden: You do not have permission to do that!',
        );
      }, 20000);
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

const notPassedIsItemInteractionClosed = (
  httpVerb: string,
  routeBase: string,
  routeCenter: string,
  routeEnd: string,
) => {
  describe('when isItemInteractionClosed was not passed', () => {
    const opened = itemInteractionStatuses[0];
    const declined = itemInteractionStatuses[1];
    const accepted = itemInteractionStatuses[2];
    // test function for all bodys in this block
    // crate item; open interaction,
    // (if status accepted, accept) (if status declined, decline),
    //  request reviewing
    const testForIsItemInteractionClosed = async (status: string) => {
      // bodo4 creates item
      const itemId = await bodo4CreatesItem('testForIsItemInteractionClosed');

      // login bibi
      const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

      let itemInteractionResponse: any = undefined;
      // bibi opens a interaction
      itemInteractionResponse = await request(app)
        .post(
          `${itemRoute}/${itemId}/${
            itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
          }`,
        )
        .send({
          itemInteraction: {
            status: 'opened',
            message: 'opening interaction for testForIsItemInteractionClosed',
          },
        })
        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
      // extract interactionId
      const interactionIdOnItem =
        itemInteractionResponse.body[0].interactions[0]._id;

      // if status is declined: decline interaction
      if (status === declined) {
        // bibi declines interaction
        itemInteractionResponse = await request(app)
          .post(
            `${itemRoute}/${itemId}/${
              itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
            }/${interactionIdOnItem}`,
          )
          .send({
            itemInteraction: {
              status: 'declined',
              message:
                'declining interaction for testForIsItemInteractionClosed',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
      }

      // logout bibi
      await logout(connectSidValueBibi);

      // login bodo4
      const connectSidValueBodo4 = await loginBodo4();

      // if status is accepted: accept interaction
      if (status === accepted) {
        // bodo accepts interaction
        itemInteractionResponse = await request(app)
          .post(
            `${itemRoute}/${itemId}/${
              itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
            }/${interactionIdOnItem}`,
          )
          .send({
            itemInteraction: {
              status: 'accepted',
              message:
                'accepting interaction for testForIsItemInteractionClosed',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);
      }

      // test review Route
      const handleItemInteractionReviewResponse = await (request(app) as any)
        [httpVerb](
          `${routeBase}/${itemId}/${routeCenter}/${interactionIdOnItem}/${routeEnd}`,
        )
        .send({
          itemInteractionReview: {
            rating: 3,
            body: 'some review text',
          },
        })
        .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

      // delete all items
      const deleteAllOfUsersItemsResponse = await request(app)
        .delete(itemRoute)
        .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

      // logout bodo4
      await logout(connectSidValueBodo4);

      expect(
        itemInteractionResponse.body[0].interactions[0].interactionStatus,
      ).toBe(status);

      // expects
      expectsForError(
        400,
        'Error: Bad Request: This operation is not allowed on the requested interaction',
        handleItemInteractionReviewResponse,
      );
    };

    describe('should respond error with statusCode400', () => {
      it(`for interactionStatus ${opened}`, async () => {
        await testForIsItemInteractionClosed(opened);
      }, 10000);

      it(`for interactionStatus ${accepted}`, async () => {
        await testForIsItemInteractionClosed(accepted);
      }, 10000);

      it(`for interactionStatus ${declined}`, async () => {
        await testForIsItemInteractionClosed(declined);
      }, 10000);
    });
  });
};

const notPassedValidateItemInteractionReview = (
  httpVerb: string,
  routeBase: string,
  routeCenter: string,
  routeEnd: string,
) => {
  describe('when validateItemInteractionReview was not passed', () => {
    describe('when invalid itemInteractionReview Body is given', () => {
      // test function for all bodys in this block
      // crate item; open, accept and close interaction; do review request with invalid bodies
      const testForInvalidItemInteractionReviewBody = async (
        statusCode: number,
        invalidity: string,
        invalidItemInteractionReviewBody: any,
      ) => {
        // define Body to be used in this test
        const itemInteractionReviewBody = invalidItemInteractionReviewBody;

        // bodo4 creates item
        const itemId = await bodo4CreatesItem(
          'testing validateItemInteraction',
        );

        // bibi opens interaction
        const interactionIdOnItem = await bibiOpensInteraction(
          itemId,
          'testing validateItemInteraction',
        );

        // bodo4 accepts and closes the interaction
        await bodo4AcceptsAndClosesInteraction(
          itemId,
          interactionIdOnItem,
          'testing validateItemInteraction',
        );

        // login bibi
        // it doesn't matter if bibi or bodo does the request
        // it was tested previous, that the currentUser is one of the interactionPartakers
        // thus it's not necessary to test for both
        const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

        // test route of interest on just created item + interaction pairing
        const handleItemInteractionResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeCenter}/${interactionIdOnItem}/${routeEnd}`,
          )
          .send(itemInteractionReviewBody)
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
        // for missing rating
        const invalidItemInteractionReviewBody1 = {
          itemInteractionReview: {
            // rating : 3,
            body: 'some string',
          },
        };

        it('for missing rating', async () => {
          await testForInvalidItemInteractionReviewBody(
            400,
            'Error: &quot;itemInteractionReview.rating&quot; is required<br> &nbsp; &nbsp;at validateItemInteractionReview',
            invalidItemInteractionReviewBody1,
          );
        }, 10000);

        // for rating is not a number
        const invalidItemInteractionReviewBody2 = {
          itemInteractionReview: {
            rating: 'not_a_number',
          },
        };

        it('for rating is not a number', async () => {
          await testForInvalidItemInteractionReviewBody(
            400,
            'Error: &quot;itemInteractionReview.rating&quot; must be a number<br> &nbsp; &nbsp;at validateItemInteractionReview',
            invalidItemInteractionReviewBody2,
          );
        }, 10000);

        // for empty body
        const invalidItemInteractionReviewBody3 = {
          //  empty body
        };

        it('for empty body', async () => {
          await testForInvalidItemInteractionReviewBody(
            400,
            'Error: &quot;itemInteractionReview&quot; is required<br> &nbsp; &nbsp;at validateItemInteractionReview',
            invalidItemInteractionReviewBody3,
          );
        }, 10000);

        // for empty itemInteractionReview
        const invalidItemInteractionReviewBody4 = {
          itemInteractionReview: {
            // no rating or review.body given
          },
        };
        it('for empty itemInteractionReview', async () => {
          await testForInvalidItemInteractionReviewBody(
            400,
            'Error: &quot;itemInteractionReview.rating&quot; is required<br> &nbsp; &nbsp;at validateItemInteractionReview',
            invalidItemInteractionReviewBody4,
          );
        }, 10000);

        // for body is not a string
        const invalidItemInteractionReviewBody5 = {
          itemInteractionReview: {
            rating: 3,
            body: 123, // not a string
          },
        };

        it('for body is not a string', async () => {
          await testForInvalidItemInteractionReviewBody(
            400,
            'Error: &quot;itemInteractionReview.body&quot; must be a string<br> &nbsp; &nbsp;at validateItemInteractionReview',
            invalidItemInteractionReviewBody5,
          );
        }, 10000);

        // for rating is 0
        const invalidItemInteractionReviewBody6 = {
          itemInteractionReview: {
            rating: 0,
          },
        };

        it('for rating is 0', async () => {
          await testForInvalidItemInteractionReviewBody(
            400,
            'Error: &quot;itemInteractionReview.rating&quot; must be greater than or equal to 1<br> &nbsp; &nbsp;at validateItemInteractionReview',
            invalidItemInteractionReviewBody6,
          );
        }, 10000);

        // for rating is higher than 5
        const invalidItemInteractionReviewBody7 = {
          itemInteractionReview: {
            rating: 6,
          },
        };

        it('for rating is higher than 5', async () => {
          await testForInvalidItemInteractionReviewBody(
            400,
            'Error: &quot;itemInteractionReview.rating&quot; must be less than or equal to 5<br> &nbsp; &nbsp;at validateItemInteractionReview',
            invalidItemInteractionReviewBody7,
          );
        }, 10000);
      });
    });
  });
};

// TESTS
describe('itemInteractionReview Route', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  afterEach(async () => {
    // login bodo4
    const connectSidValue = await loginBodo4();
    // create item as bodo4
    const deleteAllOfUsersItemsResponse = await request(app)
      .delete(itemRoute)
      .set('Cookie', [`connect.sid=${connectSidValue}`]);
    // logout bodo4
    await logout(connectSidValue);
  });

  describe(`POST ${itemIdInteractionIdReviewRoute} (reviewInteraction)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn(
      'post',
      `${itemRoute}/65673cc5811318fde3968147/${
        itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
      }/65673cc5811318fde3968158/${
        itemIdInteractionIdReviewRoute.split(':interactionId/').slice(-1)[0]
      }`,
    );
    // check if itemInteractionBelongsToItem throws appropriate errors
    notPassedItemInteractionBelongsToItem(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
      itemIdInteractionIdReviewRoute.split(':interactionId/').slice(-1)[0],
    );
    // check if isInteractionPartaker throws appropriate errors
    notPassedIsInteractionPartaker(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
      itemIdInteractionIdReviewRoute.split(':interactionId/').slice(-1)[0],
    );
    // check if isItemInteractionClosed throws appropriate errors
    notPassedIsItemInteractionClosed(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
      itemIdInteractionIdReviewRoute.split(':interactionId/').slice(-1)[0],
    );
    // check if validateItemInteractionReview throws appropriate errors
    notPassedValidateItemInteractionReview(
      'post',
      itemRoute,
      itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
      itemIdInteractionIdReviewRoute.split(':interactionId/').slice(-1)[0],
    );

    // tests for handling of review request is conducted in itemInteractionReviewRoutePOST-reviewInteraction-controller.test.ts
    // the conducted tests include expected errors, if a review was already given and expected answer, when no previous review was given
  });
});
