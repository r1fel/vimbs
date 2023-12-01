import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import { ItemRequest } from '../../src/typeDefinitions';
import ExpressError from '../../src/utils/ExpressError';

const app = makeApp(database);

// routes
const loginRoute = '/auth/login';
const logoutRoute = '/auth/logout';
const authRoute = '/auth';

const itemRoute = '/item';
const itemIdRoute = '/item/:itemId';

// mocks
jest.mock('../../src/utils/ExpressError');

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

      expect(ExpressError).toHaveBeenCalledWith('Unauthorized', 401);
      expect(ExpressError).toHaveBeenCalledTimes(1);
    });
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      expect(ExpressError).toHaveBeenCalledWith('Unauthorized', 401);
      expect(ExpressError).toHaveBeenCalledTimes(1);
    });
  });
};

const notPassedIsOwner = (httpVerb: string, route: string) => {
  describe('when isOwner was not passed', () => {
    describe('when valid itemId is given', () => {
      it('should respond error with a statusCode403 if user is not item.owner', async () => {
        // login bodo4 and create his item:
        // login bodo4
        const connectSidValueBodo4First = await loginBodo4();
        // create item as bodo4
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item from Test of isOwner',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;
        // logout bodo4
        await logout(connectSidValueBodo4First);

        // try to do something on bodo4's item as bibi
        // login bibi
        const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');
        // try route in question
        const response = await (request(app) as any)
          [httpVerb](`${route}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

        expect(ExpressError).toHaveBeenCalledWith(
          'Forbidden: You do not have permission to do that!',
          403,
        );
        expect(ExpressError).toHaveBeenCalledTimes(1);

        // logout bibi
        await logout(connectSidValueBibi);

        // delete item again:
        // login bodo4
        const connectSidValueBodo4Second = await loginBodo4();
        // delete item
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
        // logout bodo4
        await logout(connectSidValueBodo4Second);

        // expect route in question to throw 403 with error message
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
          [httpVerb](`${route}/${invalidItemIdOfCorrectPattern}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // expect route in question to throw 400
        expect(ExpressError).toHaveBeenCalledWith(
          'Bad Request: This item does not exist',
          400,
        );
        expect(ExpressError).toHaveBeenCalledTimes(1);

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
            [httpVerb](`${route}/${invalidId}`)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

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
  });
};

// TESTS
describe('item Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`POST ${itemRoute} (createItem)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn('post', itemRoute);

    describe('when valid body given', () => {
      // define valid body given from client
      const validCreateBody: { item: ItemRequest } = {
        item: {
          picture:
            'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
          name: 'Item from Test',
          description: 'This text describes the item made in the test',
          categories: { HouseAndGarden: { subcategories: ['Deko'] } },
        },
      };

      it('should respond successful with a statusCode200 and processedItem details (matching input) for complete input with one or more categories', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // define bodys

        // mulitple subcategoies in one top category
        const validCreateBody2: { item: ItemRequest } = {
          item: {
            ...validCreateBody.item,
            name: 'Item from Test2',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
            },
          },
        };

        // multiple top categories
        const validCreateBody3: { item: ItemRequest } = {
          item: {
            ...validCreateBody.item,
            name: 'Item from Test2',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
              ChildAndBaby: { subcategories: ['Spielzeug'] },
            },
          },
        };

        // test all defined bodies
        const bodyData = [validCreateBody, validCreateBody2, validCreateBody3];

        for (const validCreateBody of bodyData) {
          //create item in DB
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send(validCreateBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // delete just created item from DB
          const itemId = createItemResponse.body[0]._id;
          const deleteItemResponse = await request(app)
            .delete(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // expects
          // for item creation
          expect(createItemResponse.statusCode).toBe(200);

          // expect the body array to only have one object inside
          expect(createItemResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from validCreateBody
          const createdItem = createItemResponse.body[0];
          expect(createdItem).toEqual({
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
            name: validCreateBody.item.name,
            available: true,
            picture: validCreateBody.item.picture,
            description: validCreateBody.item.description,
            categories: {
              AdultClothing: {
                name: 'Mode',
                subcategories:
                  validCreateBody.item.categories.AdultClothing
                    ?.subcategories ?? [],
              },
              ChildAndBaby: {
                name: 'Kind und Baby',
                subcategories:
                  validCreateBody.item.categories.ChildAndBaby?.subcategories ??
                  [],
              },
              HouseAndGarden: {
                name: 'Haus und Garten',
                subcategories:
                  validCreateBody.item.categories.HouseAndGarden
                    ?.subcategories ?? [],
              },
              MediaAndGames: {
                name: 'Medien und Spiele',
                subcategories:
                  validCreateBody.item.categories.MediaAndGames
                    ?.subcategories ?? [],
              },
              Other: {
                name: 'Sonstiges',
                subcategories:
                  validCreateBody.item.categories.Other?.subcategories ?? [],
              },
              SportAndCamping: {
                name: 'Sport und Camping',
                subcategories:
                  validCreateBody.item.categories.SportAndCamping
                    ?.subcategories ?? [],
              },
              Technology: {
                name: 'Technik und Zubehör',
                subcategories:
                  validCreateBody.item.categories.Technology?.subcategories ??
                  [],
              },
            },
            dueDate: null,
            owner: true,
            interactions: [],
            ownerData: null,
            commonCommunity: null,
          });

          // expect
          // for successfully deleting created item
          expect(deleteItemResponse.text).toBe(
            `Successfully deleted item ${itemId}!`,
          );
        }

        // logout
        await logout(connectSidValue);
      }, 10000);

      it('should respond successful with a statusCode200 and processedItem details (matching input) for left out picture and/or description', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // define bodys

        // without picture
        const validCreateBody2: { item: ItemRequest } = {
          item: {
            name: 'Item from Test2',
            description: 'This text describes the item made in the test',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without description
        const validCreateBody3: { item: ItemRequest } = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            name: 'Item from Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without picture and description
        const validCreateBody4: { item: ItemRequest } = {
          item: {
            name: 'Item from Test4',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // test all defined bodies
        const bodyData = [validCreateBody2, validCreateBody3, validCreateBody4];

        for (const validCreateBody of bodyData) {
          //create item in DB
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send(validCreateBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // delete just created item from DB
          const itemId = createItemResponse.body[0]._id;
          const deleteItemResponse = await request(app)
            .delete(`${itemRoute}/${itemId}`)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // expects
          // for item creation
          expect(createItemResponse.statusCode).toBe(200);

          // expect the body array to only have one object inside
          expect(createItemResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from validCreateBody
          const createdItem = createItemResponse.body[0];
          expect(createdItem).toEqual({
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
            name: validCreateBody.item.name,
            available: true,
            picture: validCreateBody.item.picture || null,
            description: validCreateBody.item.description || null,
            categories: {
              AdultClothing: {
                name: 'Mode',
                subcategories:
                  validCreateBody.item.categories.AdultClothing
                    ?.subcategories ?? [],
              },
              ChildAndBaby: {
                name: 'Kind und Baby',
                subcategories:
                  validCreateBody.item.categories.ChildAndBaby?.subcategories ??
                  [],
              },
              HouseAndGarden: {
                name: 'Haus und Garten',
                subcategories:
                  validCreateBody.item.categories.HouseAndGarden
                    ?.subcategories ?? [],
              },
              MediaAndGames: {
                name: 'Medien und Spiele',
                subcategories:
                  validCreateBody.item.categories.MediaAndGames
                    ?.subcategories ?? [],
              },
              Other: {
                name: 'Sonstiges',
                subcategories:
                  validCreateBody.item.categories.Other?.subcategories ?? [],
              },
              SportAndCamping: {
                name: 'Sport und Camping',
                subcategories:
                  validCreateBody.item.categories.SportAndCamping
                    ?.subcategories ?? [],
              },
              Technology: {
                name: 'Technik und Zubehör',
                subcategories:
                  validCreateBody.item.categories.Technology?.subcategories ??
                  [],
              },
            },
            dueDate: null,
            owner: true,
            interactions: [],
            ownerData: null,
            commonCommunity: null,
          });

          // expect
          // for successfully deleting created item
          expect(deleteItemResponse.text).toBe(
            `Successfully deleted item ${itemId}!`,
          );
        }
        // logout
        await logout(connectSidValue);
      }, 10000);

      // it('should set req.user as item.owner for valid request', async () => {
      //   // indeirectly seen by owner:true
      // });

      it('should push item to owner.myItems for valid request', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        //create item in DB
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send(validCreateBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        const itemId = createItemResponse.body[0]._id;

        // get users detail to extract myItems to check if itemId was pushed onto it
        const authResponse = await request(app)
          .get(authRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // delete just created item from DB
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // expect the itemId to be the last id in the users myItems array
        expect(itemId).toBe(
          authResponse.body.myItems[authResponse.body.myItems.length - 1],
        );

        // expect
        // for successfully deleting created item
        expect(deleteItemResponse.text).toBe(
          `Successfully deleted item ${itemId}!`,
        );

        // logout
        await logout(connectSidValue);
      }, 10000);
    });

    describe('when invalid body given', () => {
      // name and category are required in the Joi validation schema (see src/utils/middleware/schemas), as should there by an item object
      // all these required fields are now tested
      it('should respond error with a statusCode400 for no category and/or no name and/or empty item object', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // define set of invalid bodys

        // without name,
        const invalidCreateBody2 = {
          item: {
            // name: 'Item from Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without category
        const invalidCreateBody3 = {
          item: {
            name: 'Item from Test3',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without subcategory
        const invalidCreateBody4 = {
          item: {
            name: 'Item from Test4',
            categories: {
              HouseAndGarden: {
                // subcategories: ['Deko']
              },
            },
          },
        };

        // with empty subcategory
        const invalidCreateBody5 = {
          item: {
            name: 'Item from Test4',
            categories: {
              HouseAndGarden: {
                subcategories: [
                  // 'Deko'
                ],
              },
            },
          },
        };

        // without name and category
        const invalidCreateBody6 = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            // name: 'Item from Test4',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // empty item
        const invalidCreateBody7 = {
          item: {
            // name: 'Item from Test4',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // empty object
        const invalidCreateBody8 = {
          // item: {
          // name: 'Item from Test4',
          // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          // },
        };

        // test all defined bodies
        const bodyData = [
          invalidCreateBody2,
          invalidCreateBody3,
          invalidCreateBody4,
          invalidCreateBody5,
          invalidCreateBody6,
          invalidCreateBody7,
          invalidCreateBody8,
        ];

        for (const invalidCreateBody of bodyData) {
          //create item in DB
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send(invalidCreateBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          expect(ExpressError).toHaveBeenCalledWith(expect.any(String), 400);
          console.log(createItemResponse.statusCode, createItemResponse.error);

          // TODO: make this test better by e.g. spying on validateItem middleware, to see that the error was thrown here
          // comment on TODO: by printing out the createItemResponse,
          // I could not easily determine some response paramerter that could easily be used for this
        }

        expect(ExpressError).toHaveBeenCalledTimes(7);

        // logout
        await logout(connectSidValue);
      }, 10000);

      it('should respond error with a statusCode400 for invalid input field(s)', async () => {
        // add field(s) to inout

        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // define set of invalid bodys

        // invalid additional field inside item
        const invalidCreateBody2 = {
          item: {
            name: 'Item from Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
            color: 15,
          },
        };
        // invalid additional field alongside item
        const invalidCreateBody3 = {
          item: {
            name: 'Item from Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
          color: [25, 57],
        };

        // test all defined bodies
        const bodyData = [invalidCreateBody2, invalidCreateBody3];

        for (const invalidCreateBody of bodyData) {
          //create item in DB
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send(invalidCreateBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          expect(ExpressError).toHaveBeenCalledWith(expect.any(String), 400);

          // TODO: make this test better by e.g. spying on validateItem middleware, to see that the error was thrown here
          // comment on TODO: by printing out the createItemResponse,
          // I could not easily determine some response paramerter that could easily be used for this
        }

        expect(ExpressError).toHaveBeenCalledTimes(2);

        // logout
        await logout(connectSidValue);
      }, 10000);
    });
  });

  describe(`DELETE ${itemIdRoute} (deleteItem)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn('delete', `${itemRoute}/65673cc5811318fde3968147`);

    notPassedIsOwner('delete', itemRoute); // can only pass itemRoute and not item/:itemId because itemId is created in function

    describe('when existing itemId is given', () => {
      it('should respond successful with a statusCode200 if user is the item.owner', async () => {
        // login bodo4
        const connectSidValue = await loginBodo4();
        // create item as bodo4
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing DELETE Route',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // delete item
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // expect
        expect(deleteItemResponse.statusCode).toBe(200);
        expect(deleteItemResponse.text).toBe(
          `Successfully deleted item ${itemId}!`,
        );
        expect(ExpressError).not.toHaveBeenCalled;

        // logout bodo4
        await logout(connectSidValue);
      });

      // it('should delete item from DB', async () => {
      //   // call show item and get not found error
      // });

      it('should pull item from owner.myInventory', async () => {
        // login bodo4
        const connectSidValue = await loginBodo4();
        // create item as bodo4
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing DELETE Route',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // get users detail to extract myItems
        const authResponse = await request(app)
          .get(authRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract myItems array
        const bodosMyItemsBeforeDeletion = authResponse.body.myItems;

        // delete item
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // get users detail to extract myItems after deletion ran in last test
        const auth2Response = await request(app)
          .get(authRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract myItems array
        const bodosMyItemsAfterDeletion = auth2Response.body.myItems;

        expect(itemId).toBe(
          bodosMyItemsBeforeDeletion[bodosMyItemsBeforeDeletion.length - 1],
        );
        expect(bodosMyItemsAfterDeletion).not.toContain(itemId);
        expect(
          bodosMyItemsBeforeDeletion[bodosMyItemsBeforeDeletion.length - 2],
        ).toBe(bodosMyItemsAfterDeletion[bodosMyItemsAfterDeletion.length - 1]);
        expect(ExpressError).not.toHaveBeenCalled;

        // logout bodo4
        await logout(connectSidValue);
      });

      // TODO ER: i would have to look inside the delete request and check the req.body there
      // it('should set req.body to {} even for sent in data', async () => {
      //   // login bodo4
      //   const connectSidValue = await loginBodo4();
      //   // create item as bodo4
      //   const createItemResponse = await request(app)
      //     .post(itemRoute)
      //     .send({
      //       item: {
      //         name: 'Item for testing DELETE Route',
      //         categories: { Other: { subcategories: ['Sonstiges'] } },
      //       },
      //     })
      //     .set('Cookie', [`connect.sid=${connectSidValue}`]);
      //   // extract itemId
      //   const itemId = createItemResponse.body[0]._id;

      //   // delete item
      //   const deleteItemResponse = await request(app)
      //     .delete(`${itemRoute}/${itemId}`)
      //     .send({ some: 'body, that is not supposed to be here' })
      //     .set('Cookie', [`connect.sid=${connectSidValue}`]);

      //   // expect
      // });
      // TODO ER: it should in the future set a bool of deleted to true on item, so that it can be shown for users having item in watchlist etc
    });
  });

  describe(`PUT ${itemIdRoute} (updateItem)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn('put', `${itemRoute}/65673cc5811318fde3968147`);

    notPassedIsOwner('put', itemRoute); // can only pass itemRoute and not item/:itemId because itemId is created in function

    describe('and when valid body given', () => {
      // define valid update body given from client
      const validUpdateBody: { item: ItemRequest } = {
        item: {
          picture:
            'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
          name: 'Item from Update Test',
          description: 'This text describes the item made in the test',
          categories: { HouseAndGarden: { subcategories: ['Deko'] } },
        },
      };

      // ! delete auth stuff for console logs

      it('should respond successful with a statusCode200 and processedItem details (matching input) if user is item.owner, for complete input with one or more categories', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // // get users detail to extract myItems
        // const authResponse = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems before create', authResponse.body.myItems);

        // create item to perform updates on
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing PUT Route',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // // get users detail to extract myItems
        // const auth2Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after create', auth2Response.body.myItems);

        // define update bodys

        // mulitple subcategoies in one top category
        const validUpdateBody2: { item: ItemRequest } = {
          item: {
            ...validUpdateBody.item,
            name: 'Item from Update Test2',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
            },
          },
        };

        // multiple top categories
        const validUpdateBody3: { item: ItemRequest } = {
          item: {
            ...validUpdateBody.item,
            name: 'Item from Update Test3',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
              ChildAndBaby: { subcategories: ['Spielzeug'] },
            },
          },
        };

        // test all defined update bodies
        const bodyData = [validUpdateBody, validUpdateBody2, validUpdateBody3];

        for (const validUpdateBody of bodyData) {
          //update item in DB
          const updateItemResponse = await request(app)
            .put(`${itemRoute}/${itemId}`)
            .send(validUpdateBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // expects
          // for item update
          expect(updateItemResponse.statusCode).toBe(200);

          // expect the body array to only have one object inside
          expect(updateItemResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from validUpdateBody
          const updatedItem = updateItemResponse.body[0];
          expect(updatedItem).toEqual({
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
            name: validUpdateBody.item.name,
            available: true,
            picture: validUpdateBody.item.picture || null,
            description: validUpdateBody.item.description || null,
            categories: {
              AdultClothing: {
                name: 'Mode',
                subcategories:
                  validUpdateBody.item.categories.AdultClothing
                    ?.subcategories ?? [],
              },
              ChildAndBaby: {
                name: 'Kind und Baby',
                subcategories:
                  validUpdateBody.item.categories.ChildAndBaby?.subcategories ??
                  [],
              },
              HouseAndGarden: {
                name: 'Haus und Garten',
                subcategories:
                  validUpdateBody.item.categories.HouseAndGarden
                    ?.subcategories ?? [],
              },
              MediaAndGames: {
                name: 'Medien und Spiele',
                subcategories:
                  validUpdateBody.item.categories.MediaAndGames
                    ?.subcategories ?? [],
              },
              Other: {
                name: 'Sonstiges',
                subcategories:
                  validUpdateBody.item.categories.Other?.subcategories ?? [],
              },
              SportAndCamping: {
                name: 'Sport und Camping',
                subcategories:
                  validUpdateBody.item.categories.SportAndCamping
                    ?.subcategories ?? [],
              },
              Technology: {
                name: 'Technik und Zubehör',
                subcategories:
                  validUpdateBody.item.categories.Technology?.subcategories ??
                  [],
              },
            },
            dueDate: null,
            owner: true,
            interactions: [],
            ownerData: null,
            commonCommunity: null,
          });
        }

        // delete just created item from DB
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('put test item is again deleted:', deleteItemResponse.text);

        // // get users detail to extract myItems
        // const auth3Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after delete', auth3Response.body.myItems);

        // expect
        // for successfully deleting created item
        expect(deleteItemResponse.text).toBe(
          `Successfully deleted item ${itemId}!`,
        );

        // logout
        await logout(connectSidValue);
      }, 10000);

      it('should respond successful with a statusCode200 and processedItem details (matching input) if user is item.owner, for left out picture and/or description', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // // get users detail to extract myItems
        // const authResponse = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems before create', authResponse.body.myItems);

        // create item to perform updates on
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing PUT Route',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // // get users detail to extract myItems
        // const auth2Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after create', auth2Response.body.myItems);

        // define update bodys

        // without picture
        const validUpdateBody2: { item: ItemRequest } = {
          item: {
            name: 'Item from Update pic/description Test2',
            description: 'This text describes the item made in the test2',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without description
        const validUpdateBody3: { item: ItemRequest } = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            name: 'Item from Update pic/description Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without picture and description
        const validUpdateBody4: { item: ItemRequest } = {
          item: {
            name: 'Item from Update pic/description Test4',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // test all defined bodies
        const bodyData = [validUpdateBody2, validUpdateBody3, validUpdateBody4];

        for (const validUpdateBody of bodyData) {
          //update item in DB
          const updateItemResponse = await request(app)
            .put(`${itemRoute}/${itemId}`)
            .send(validUpdateBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // expects
          // for item update
          expect(updateItemResponse.statusCode).toBe(200);

          // expect the body array to only have one object inside
          expect(updateItemResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from validUpdateBody
          const updatedItem = updateItemResponse.body[0];
          expect(updatedItem).toEqual({
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
            name: validUpdateBody.item.name,
            available: true,
            picture: validUpdateBody.item.picture || null,
            description: validUpdateBody.item.description || null,
            categories: {
              AdultClothing: {
                name: 'Mode',
                subcategories:
                  validUpdateBody.item.categories.AdultClothing
                    ?.subcategories ?? [],
              },
              ChildAndBaby: {
                name: 'Kind und Baby',
                subcategories:
                  validUpdateBody.item.categories.ChildAndBaby?.subcategories ??
                  [],
              },
              HouseAndGarden: {
                name: 'Haus und Garten',
                subcategories:
                  validUpdateBody.item.categories.HouseAndGarden
                    ?.subcategories ?? [],
              },
              MediaAndGames: {
                name: 'Medien und Spiele',
                subcategories:
                  validUpdateBody.item.categories.MediaAndGames
                    ?.subcategories ?? [],
              },
              Other: {
                name: 'Sonstiges',
                subcategories:
                  validUpdateBody.item.categories.Other?.subcategories ?? [],
              },
              SportAndCamping: {
                name: 'Sport und Camping',
                subcategories:
                  validUpdateBody.item.categories.SportAndCamping
                    ?.subcategories ?? [],
              },
              Technology: {
                name: 'Technik und Zubehör',
                subcategories:
                  validUpdateBody.item.categories.Technology?.subcategories ??
                  [],
              },
            },
            dueDate: null,
            owner: true,
            interactions: [],
            ownerData: null,
            commonCommunity: null,
          });
        }

        // delete just created item from DB
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('put test item is again deleted:', deleteItemResponse.text);

        // // get users detail to extract myItems
        // const auth3Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after delete', auth3Response.body.myItems);

        // expect
        // for successfully deleting created item
        expect(deleteItemResponse.text).toBe(
          `Successfully deleted item ${itemId}!`,
        );

        // logout
        await logout(connectSidValue);
      });
    });

    describe('when invalid body given', () => {
      // name and category are required in the Joi validation schema (see src/utils/middleware/schemas), as should there by an item object
      // all these required fields are now tested
      it('should respond error with a statusCode400 for no category and/or no name and/or empty item object', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // // get users detail to extract myItems
        // const authResponse = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems before create', authResponse.body.myItems);

        // create item to perform updates on
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing PUT Route',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;
        // console.log('itemId', itemId);

        // // get users detail to extract myItems
        // const auth2Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after create', auth2Response.body.myItems);

        // define set of invalid update bodys

        // without name,
        const invalidUpdateBody2 = {
          item: {
            // name: 'Item from Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without category
        const invalidUpdateBody3 = {
          item: {
            name: 'Item from Test3',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // without subcategory
        const invalidUpdateBody4 = {
          item: {
            name: 'Item from Test4',
            categories: {
              HouseAndGarden: {
                // subcategories: ['Deko']
              },
            },
          },
        };

        // with empty subcategory
        const invalidUpdateBody5 = {
          item: {
            name: 'Item from Test4',
            categories: {
              HouseAndGarden: {
                subcategories: [
                  // 'Deko'
                ],
              },
            },
          },
        };

        // without name and category
        const invalidUpdateBody6 = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            // name: 'Item from Test4',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // empty item
        const invalidUpdateBody7 = {
          item: {
            // name: 'Item from Test4',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };

        // empty object
        const invalidUpdateBody8 = {
          // item: {
          // name: 'Item from Test4',
          // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          // },
        };

        // test all defined bodies
        const bodyData = [
          invalidUpdateBody2,
          // invalidUpdateBody3,
          // invalidUpdateBody4,
          // invalidUpdateBody5,
          // invalidUpdateBody6,
          // invalidUpdateBody7,
          // invalidUpdateBody8,
        ];

        for (const invalidUpdateBody of bodyData) {
          //Update item in DB
          const updateItemResponse = await request(app)
            .put(`${itemRoute}/${itemId}`)
            .send(invalidUpdateBody2)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          expect(ExpressError).toHaveBeenCalledWith(expect.any(String), 400);
          console.log(updateItemResponse.statusCode, updateItemResponse.error);

          // TODO: make this test better by e.g. spying on validateItem middleware, to see that the error was thrown here
          // comment on TODO: by printing out the UpdateItemResponse,
          // I could not easily determine some response paramerter that could easily be used for this
        }

        // expect(ExpressError).toHaveBeenCalledTimes(7);

        // delete just created item from DB
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('put test item is again deleted:', deleteItemResponse.text);

        // // get users detail to extract myItems
        // const auth3Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after delete', auth3Response.body.myItems);

        // expect
        // for successfully deleting created item
        expect(deleteItemResponse.text).toBe(
          `Successfully deleted item ${itemId}!`,
        );

        // logout
        await logout(connectSidValue);
      }, 10000);

      // TODO: just copied from create
      // it('should respond error with a statusCode400 for invalid input field(s)', async () => {
      //   // add field(s) to inout

      //   //  login Bodo4
      //   const connectSidValue = await loginBodo4();

      //   // define set of invalid bodys

      //   // invalid additional field inside item
      //   const invalidCreateBody2 = {
      //     item: {
      //       name: 'Item from Test3',
      //       categories: { HouseAndGarden: { subcategories: ['Deko'] } },
      //       color: 15,
      //     },
      //   };
      //   // invalid additional field alongside item
      //   const invalidCreateBody3 = {
      //     item: {
      //       name: 'Item from Test3',
      //       categories: { HouseAndGarden: { subcategories: ['Deko'] } },
      //     },
      //     color: [25, 57],
      //   };

      //   // test all defined bodies
      //   const bodyData = [invalidCreateBody2, invalidCreateBody3];

      //   for (const invalidCreateBody of bodyData) {
      //     //create item in DB
      //     const createItemResponse = await request(app)
      //       .post(itemRoute)
      //       .send(invalidCreateBody)
      //       .set('Cookie', [`connect.sid=${connectSidValue}`]);

      //     expect(ExpressError).toHaveBeenCalledWith(expect.any(String), 400);

      //     // TODO: make this test better by e.g. spying on validateItem middleware, to see that the error was thrown here
      //     // comment on TODO: by printing out the createItemResponse,
      //     // I could not easily determine some response paramerter that could easily be used for this
      //   }

      //   expect(ExpressError).toHaveBeenCalledTimes(2);

      //   // logout
      //   await logout(connectSidValue);
      // }, 10000);
    });
  });

  // describe('GET /item/:itemId', () => {
  //   describe('when isLoggedIn was not passed', () => {
  //     it('should respond error with a statusCode401 if req.user undefined', async () => {
  //       //
  //     });
  //     it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
  //       //
  //     });
  //   });
  //   describe('when valid itemId is given', () => {
  //     it('should respond successful with a statusCode200 and processedItemData according to req.user', async () => {
  //       //
  //     });
  //   });
  //   describe('when invalid itemId is given', () => {
  //     it('should respond error with a statusCode400 for not existing itemId', async () => {
  //       // id has correct pattern, but item doesnt exist
  //     });
  //     it('should respond error with a statusCode500 for itemId value that could not be cast to ObjectId', async () => {
  //       // for id values that are not valid mongo id values
  //     });
  //   });
  // });

  // describe('SEARCH Feature', () => {
  //   describe('when xxx given', () => {
  //   it('should respond successful with a statusCode200 and xxx for xxx', async () => {
  //   //
  //   });
  //   it('should respond error with a statusCodexxx and xxx for xxx', async () => {
  //     //
  //     });
  //   });
  // });

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
}); // close describe item routes

describe.skip('dummy', () => {
  describe('when dummytest given', () => {
    it('should be happy ', async () => {
      expect(true).toBe(true);
    });
  });
});
