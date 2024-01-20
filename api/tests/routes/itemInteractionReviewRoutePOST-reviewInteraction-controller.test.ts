import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';

import { ItemInteractionReviewRequest } from '../../src/typeDefinitions';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  authRoute,
  itemRoute,
  itemIdInteractionRoute,
  itemIdInteractionIdReviewRoute,
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
    // middleware tested in itemInteractionReviewRoutePOST-reviewInteraction-middleware.test.ts
    describe('when itemInteractionReview body is dealt with at controller', () => {
      describe('should respond error with a statusCode400 when review was already given', () => {
        // test:
        // general: create item, open interaction, accept and close interaction

        // if giver:
        // login bodo4, review for bibi, logout bodo4
        // login bibi, get auth before error causing second review try of bodo4, logout bibi
        // login bodo4, review try 2 for bibi (error causing), logout bodo4
        // login bibi, get auth after error causing second review try of bodo4 to check against auth before (no changes expected), logout bibi

        // if getter:
        // login bibi, review for bodo4, logout bibi
        // login bodo4, get auth before error causing second review try of bibi, logout bodo4
        // login bibi, review try 2 for bodo4 (error causing), logout bibi
        // login bodo4, get auth after error causing second review try of bibi to check against auth before (no changes expected), logout bodo4

        // genereal: login bodo4, delete item, logout bodo4

        const testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction =
          async (
            interactingParty: 'giver' | 'getter',
            statusCode: number,
            invalidity: string,
            // validItemInteractionReviewBody: {
            //   itemInteraction: ItemInteractionRequest;
            // },
          ) => {
            // define Body to be used in this test
            // const itemInteractionBody = validItemInteractionReviewBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(
              'testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
            );

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              'testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
            );

            // bodo4 accepts and closes the interaction
            await bodo4AcceptsAndClosesInteraction(
              itemId,
              interactionIdOnItem,
              'testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
            );

            // define variables to be tested
            let getAuthBefore: any = undefined;
            let itemInteractionReviewResponseReview2: any = undefined;
            let getAuthAfter: any = undefined;

            if (interactingParty === 'giver') {
              // login Bodo4
              const connectSidValueBodo4 = await loginBodo4();

              // set a first review on bibi
              const itemInteractionReviewResponseReview1ByBodo = await request(
                app,
              )
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}/${
                    itemIdInteractionIdReviewRoute
                      .split(':interactionId/')
                      .slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteractionReview: {
                    rating: 5,
                    body: 'review 1 for bibi from testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);
              // console.log(
              //   'response review 1',
              //   itemInteractionReviewResponseReview1ByBodo.text,
              // );

              // logout bodo
              await logout(connectSidValueBodo4);
            }

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            if (interactingParty === 'giver') {
              // auth for bibi before the false review is given
              getAuthBefore = await request(app)
                .get(authRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // console.log('auth before', getAuthBefore.body);
            }

            if (interactingParty === 'getter') {
              // set a first review on bibi
              const itemInteractionReviewResponseReview1ByBibi = await request(
                app,
              )
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}/${
                    itemIdInteractionIdReviewRoute
                      .split(':interactionId/')
                      .slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteractionReview: {
                    rating: 5,
                    body: 'review 1 for bodo from testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              console.log(
                'response review 1',
                itemInteractionReviewResponseReview1ByBibi.text,
              );
            }

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            if (interactingParty === 'getter') {
              // auth for bodo before the false review is given
              getAuthBefore = await request(app)
                .get(authRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              // console.log('auth before', getAuthBefore.body);
            }

            if (interactingParty === 'giver') {
              // try to set second review on bibi
              itemInteractionReviewResponseReview2 = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}/${
                    itemIdInteractionIdReviewRoute
                      .split(':interactionId/')
                      .slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteractionReview: {
                    rating: 1,
                    body: 'review 2 for bibi from testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // console.log(
              //   'response review 2',
              //   itemInteractionReviewResponseReview2.text,
              // );
            }

            // logout
            await logout(connectSidValueBodo4Second);

            // login bibi
            const connectSidValueBibiSecond = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            if (interactingParty === 'giver') {
              // auth for bibi after the false review was given
              getAuthAfter = await request(app)
                .get(authRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);
              // console.log('auth after', getAuthAfter.body);
            }

            if (interactingParty === 'getter') {
              // try to set second review on bodo
              itemInteractionReviewResponseReview2 = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}/${
                    itemIdInteractionIdReviewRoute
                      .split(':interactionId/')
                      .slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteractionReview: {
                    rating: 1,
                    body: 'review 2 for bodo from testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);
              // console.log(
              //   'response review 2',
              //   itemInteractionReviewResponseReview2.text,
              // );
            }

            // logout bibi
            await logout(connectSidValueBibiSecond);

            // login Bodo4
            const connectSidValueBodo4Third = await loginBodo4();

            if (interactingParty === 'getter') {
              // auth for bodo after the false review was given
              getAuthAfter = await request(app)
                .get(authRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);
              // console.log('auth after', getAuthAfter.body);
            }

            // delete all items (and clear bibi and bodo4s reviews)
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

            // logout
            await logout(connectSidValueBodo4Third);

            //test that no changes are made on the user by the falsy request
            // comment: the version number of the the entry changes, thus just comparing Auth.body throws an error
            expect(getAuthBefore.body).not.toBe(undefined);
            expect(getAuthAfter.body).not.toBe(undefined);
            expect(getAuthBefore.body.giveReviews).toEqual(
              getAuthAfter.body.giveReviews,
            );
            expect(getAuthBefore.body.giveReviewStats).toEqual(
              getAuthAfter.body.giveReviewStats,
            );
            expect(getAuthBefore.body.getReviews).toEqual(
              getAuthAfter.body.getReviews,
            );
            expect(getAuthBefore.body.getReviewStats).toEqual(
              getAuthAfter.body.getReviewStats,
            );

            expectsForError(
              statusCode,
              invalidity,
              itemInteractionReviewResponseReview2,
            );
          };

        it('by owner', async () => {
          await testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction(
            'giver',
            400,
            'Error: Bad Request: You already gave the review &gt;review 1 for bibi from testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction&lt; <br> &nbsp; &nbsp; with a rating of 5 <br> &nbsp; &nbsp; on your interaction with bibi on &gt;Item for testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
          );
        }, 20000);

        it('by interrestedParty', async () => {
          await testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction(
            'getter',
            400,
            'Error: Bad Request: You already gave the review &gt;review 1 for bodo from testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction&lt; <br> &nbsp; &nbsp; with a rating of 5 <br> &nbsp; &nbsp; on your interaction with bodo4 on &gt;Item for testForRequestingItemInteractionReviewOnAlreadyReviewedInteraction',
          );
        }, 20000);
      });
      describe('should respond successful with a statusCode200 and success message', () => {
        // expect statements for all tests in this block
        const expectsForRequestingItemInteractionReview = (
          interactingParty: 'giver' | 'getter',
          interactionIdOnItem: string,
          itemInteractionReviewBody: {
            itemInteractionReview: ItemInteractionReviewRequest;
          },
          itemInteractionReviewResponse: request.Response,
          getAuthReviewerBefore: request.Response,
          getAuthReviewerAfter: request.Response,
          getAuthBeforeReviewIsPushed: request.Response,
          getAuthAfterReviewIsPushed: request.Response,
          getShowItemResponseBefore: request.Response,
          getShowItemResponseAfter: request.Response,
        ) => {
          // expects
          expect(itemInteractionReviewResponse.statusCode).toBe(200);
          // expect the sent body to be the following sentance
          expect(itemInteractionReviewResponse.text).toBe(
            `You sucessfully gave the review >${
              itemInteractionReviewBody.itemInteractionReview.body
            }< with a rating of ${
              itemInteractionReviewBody.itemInteractionReview.rating
            } on your interaction with ${
              interactingParty === 'giver' ? 'bibi' : 'bodo4'
            } on >Item for testForRequestingItemInteractionReview<`,
          );

          // expect non of the get Auth responses to be undefined
          expect([
            getAuthReviewerBefore.body,
            getAuthReviewerAfter.body,
            getAuthBeforeReviewIsPushed.body,
            getAuthAfterReviewIsPushed.body,
          ]).toEqual(expect.not.arrayContaining([undefined]));

          // expect the get Auth responses of the reviewer to be unchanged
          // comment: the version number of the the entry changes, thus just comparing Auth.body throws an error
          expect(getAuthReviewerBefore.body.getReviews).toEqual(
            getAuthReviewerAfter.body.getReviews,
          );
          expect(getAuthReviewerBefore.body.giveReviews).toEqual(
            getAuthReviewerAfter.body.giveReviews,
          );
          expect(getAuthReviewerBefore.body.getReviewStats).toEqual(
            getAuthReviewerAfter.body.getReviewStats,
          );
          expect(getAuthReviewerBefore.body.giveReviewStats).toEqual(
            getAuthReviewerAfter.body.giveReviewStats,
          );

          //expects of the get Auth responses of the review reciving party
          if (interactingParty === 'giver') {
            // expect giveReviews to be unchanged
            // expect giveReviewStats to be unchanged
            expect(getAuthBeforeReviewIsPushed.body.giveReviews).toEqual(
              getAuthAfterReviewIsPushed.body.giveReviews,
            );
            expect(getAuthBeforeReviewIsPushed.body.giveReviewStats).toEqual(
              getAuthAfterReviewIsPushed.body.giveReviewStats,
            );

            // expect getReviews in getAuthAfterReviewIsPushed to include Review as last and only entry
            expect(getAuthBeforeReviewIsPushed.body.getReviews).not.toEqual(
              getAuthAfterReviewIsPushed.body.getReviews,
            );
            // specific check of expected content
            expect(getAuthAfterReviewIsPushed.body.getReviews).toEqual([
              {
                _id: expect.any(String),
                interactionId: interactionIdOnItem,
                rating: itemInteractionReviewBody.itemInteractionReview.rating,
                ...(itemInteractionReviewBody.itemInteractionReview.body
                  ? {
                      body: itemInteractionReviewBody.itemInteractionReview
                        .body,
                    }
                  : {}),
              },
            ]);

            // expect getReviewStats in getAuthAfterReviewIsPushed to include Review as last and only entry
            expect(getAuthBeforeReviewIsPushed.body.getReviewStats).not.toEqual(
              getAuthAfterReviewIsPushed.body.getReviewStats,
            );
            //specific check of expected content
            expect(getAuthAfterReviewIsPushed.body.getReviewStats).toEqual({
              count: 1,
              meanRating: 5,
            });
          }
          if (interactingParty === 'getter') {
            // expect getReviews to be unchanged
            // expect getReviewStats to be unchanged
            expect(getAuthBeforeReviewIsPushed.body.getReviews).toEqual(
              getAuthAfterReviewIsPushed.body.getReviews,
            );
            expect(getAuthBeforeReviewIsPushed.body.getReviewStats).toEqual(
              getAuthAfterReviewIsPushed.body.getReviewStats,
            );

            // expect giveReviews in getAuthAfterReviewIsPushed to include Review as last and only entry
            expect(getAuthBeforeReviewIsPushed.body.giveReviews).not.toEqual(
              getAuthAfterReviewIsPushed.body.giveReviews,
            );
            // specific check of expected content
            expect(getAuthAfterReviewIsPushed.body.giveReviews).toEqual([
              {
                _id: expect.any(String),
                interactionId: interactionIdOnItem,
                rating: itemInteractionReviewBody.itemInteractionReview.rating,
                ...(itemInteractionReviewBody.itemInteractionReview.body
                  ? {
                      body: itemInteractionReviewBody.itemInteractionReview
                        .body,
                    }
                  : {}),
              },
            ]);

            // expect giveReviewStats in getAuthAfterReviewIsPushed to include Review as last and only entry
            expect(
              getAuthBeforeReviewIsPushed.body.giveReviewStats,
            ).not.toEqual(getAuthAfterReviewIsPushed.body.giveReviewStats);
            //specific check of expected content
            expect(getAuthAfterReviewIsPushed.body.giveReviewStats).toEqual({
              count: 1,
              meanRating: 5,
            });
          }

          //expect that requesting the item before the review and after the review invokes no change on the item and the interaction
          expect(getShowItemResponseBefore.body).toEqual(
            getShowItemResponseAfter.body,
          );
        };

        // test:
        // general: create item, open interaction, accept and close interaction

        // if giver:
        // login bibi, getAuthBeforeReviewIsPushed, logout bibi
        // login bodo4, getAuthReviewerBefore, review for bibi, getAuthReviewerAfter, logout bodo4
        // login bibi, ggetAuthAfterReviewIsPushed, logout bibi

        // if getter:
        // login bodo4, getAuthBeforeReviewIsPushed, logout bodo4
        // login bibi, getAuthReviewerBefore, review for bodo4, getAuthReviewerAfter, logout bibi
        // login bodo4, ggetAuthAfterReviewIsPushed, logout bodo4

        // genereal: login bodo4, delete item, logout bodo4
        const testForRequestingItemInteractionReview = async (
          interactingParty: 'giver' | 'getter', // the person giving the review
          validItemInteractionReviewBody: {
            itemInteractionReview: ItemInteractionReviewRequest;
          },
        ) => {
          // define Body to be used in this test
          const itemInteractionReviewBody = validItemInteractionReviewBody;

          // bodo4 creates item
          const itemId = await bodo4CreatesItem(
            'testForRequestingItemInteractionReview',
          );

          // bibi opens interaction
          const interactionIdOnItem = await bibiOpensInteraction(
            itemId,
            'testForRequestingItemInteractionReview',
          );

          // bodo4 accepts and closes the interaction
          await bodo4AcceptsAndClosesInteraction(
            itemId,
            interactionIdOnItem,
            'testForRequestingItemInteractionReview',
          );

          // define variable to be tested for review Response
          let itemInteractionReviewResponse: any = undefined;

          // login bibi
          const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');
          // auth for bibi before review is given
          const getAuthBeforeReviewBibi = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
          // console.log('auth before', getAuthBefore.body);

          // logout bibi
          await logout(connectSidValueBibi);

          // login bodo4
          const connectSidValueBodo4 = await await loginBodo4();
          // auth for bodo4 before review is given
          const getAuthBeforeReviewBodo4 = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);
          // console.log('auth before', getAuthBefore.body);

          // getShowItem before reviewing
          const getShowItemResponseBefore = await request(app)
            .get(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4}`]);

          // logout bodo4
          await logout(connectSidValueBodo4);

          if (interactingParty === 'giver') {
            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            // set review on bibi
            itemInteractionReviewResponse = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}/${
                  itemIdInteractionIdReviewRoute
                    .split(':interactionId/')
                    .slice(-1)[0]
                }`,
              )
              .send(itemInteractionReviewBody)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
            console.log(
              'response review bodo reviews bibi:',
              itemInteractionReviewResponse.text,
            );
            // logout bodo
            await logout(connectSidValueBodo4Second);
          }

          if (interactingParty === 'getter') {
            // login bibi
            const connectSidValueBibiSecond = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // set review on bodo4
            itemInteractionReviewResponse = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}/${
                  itemIdInteractionIdReviewRoute
                    .split(':interactionId/')
                    .slice(-1)[0]
                }`,
              )
              .send(itemInteractionReviewBody)
              .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);

            console.log(
              'response review bibi reviews bodo:',
              itemInteractionReviewResponse.text,
            );

            // logout bibi
            await logout(connectSidValueBibiSecond);
          }

          // login bibi
          const connectSidValueBibiThird = await loginUser(
            'bibi@gmail.com',
            'bibi',
          );
          // auth for bibi before review is given
          const getAuthAfterReviewBibi = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBibiThird}`]);
          // console.log('getAuthAfterReviewBibi', getAuthAfterReviewBibi.body);

          // logout bibi
          await logout(connectSidValueBibiThird);

          // login Bodo4
          const connectSidValueBodo4Third = await loginBodo4();

          // auth for bodo after the false review was given
          const getAuthAfterReviewBodo4 = await request(app)
            .get(authRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);
          // console.log('getAuthAfterReviewBodo4', getAuthAfterReviewBodo4.body);

          // getShowItem after reviewing
          const getShowItemResponseAfter = await request(app)
            .get(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

          // delete all items (and clear bibi and bodo4s reviews)
          const deleteAllOfUsersItemsResponse = await request(app)
            .delete(itemRoute)
            .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

          // logout
          await logout(connectSidValueBodo4Third);

          // define further variables to be tested
          const getAuthReviewerBefore =
            interactingParty === 'giver'
              ? getAuthBeforeReviewBodo4
              : getAuthBeforeReviewBibi;
          const getAuthReviewerAfter =
            interactingParty === 'giver'
              ? getAuthAfterReviewBodo4
              : getAuthAfterReviewBibi;
          const getAuthBeforeReviewIsPushed =
            interactingParty === 'giver'
              ? getAuthBeforeReviewBibi
              : getAuthBeforeReviewBodo4;
          const getAuthAfterReviewIsPushed =
            interactingParty === 'giver'
              ? getAuthAfterReviewBibi
              : getAuthAfterReviewBodo4;

          expectsForRequestingItemInteractionReview(
            interactingParty,
            interactionIdOnItem,
            itemInteractionReviewBody,
            itemInteractionReviewResponse,
            getAuthReviewerBefore,
            getAuthReviewerAfter,
            getAuthBeforeReviewIsPushed,
            getAuthAfterReviewIsPushed,
            getShowItemResponseBefore,
            getShowItemResponseAfter,
          );
        };

        // with rating and body
        const validItemInteractionReviewBody1 = {
          itemInteractionReview: {
            rating: 5,
            body: 'bodo gives bibi a review',
          },
        };
        const validItemInteractionReviewBody3 = {
          itemInteractionReview: {
            rating: 5,
            body: 'bibi gives bodo a review',
          },
        };

        // with rating and no body
        const validItemInteractionReviewBody2 = {
          itemInteractionReview: {
            rating: 5,
            // no body,
          },
        };
        describe('by owner', () => {
          it('with rating and body', async () => {
            await testForRequestingItemInteractionReview(
              'giver',
              validItemInteractionReviewBody1,
            );
          }, 20000);

          it('with rating and no body', async () => {
            await testForRequestingItemInteractionReview(
              'giver',
              validItemInteractionReviewBody2,
            );
          }, 20000);
        });

        describe('by interestedParty', () => {
          it('with rating and body', async () => {
            await testForRequestingItemInteractionReview(
              'getter',
              validItemInteractionReviewBody3,
            );
          }, 20000);

          it('with rating and no body', async () => {
            await testForRequestingItemInteractionReview(
              'getter',
              validItemInteractionReviewBody2,
            );
          }, 20000);
        });
      });
    });
  });
});
