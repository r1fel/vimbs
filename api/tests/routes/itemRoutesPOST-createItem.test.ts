import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import { ItemRequest } from '../../src/typeDefinitions';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  authRoute,
  itemRoute,
} from './utilsForRoutes';

// frequently used functions
export const loginBodo4 = async () => {
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

export const loginUser = async (email: string, password: string) => {
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

export const logout = async (connectSidValue: string) => {
  await request(app)
    .post(logoutRoute)
    .set('Cookie', [`connect.sid=${connectSidValue}`]);
};

// pass in the route which is protected by the isLoggedIn middleware
// test, that middleware is doing it's route protecting properly
export const notPassedIsLoggedIn = (httpVerb: string, route: string) => {
  const invalidConnectSidValue =
    's%3AnFsjM4XUm0O8fA0JrqIKBQFDjTOp538v.uJgEmwcCkUfu1fIRpleL0DTM58naHwgEzD5gDw%2B82tY';

  describe('when isLoggedIn was not passed', () => {
    it('should respond error with a statusCode401 if req.user undefined', async () => {
      const response = await (request(app) as any)[httpVerb](route);

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    });
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    });
  });
};

const checkResponseToBeCorrectlyProcessedItemForClient = (validBody: {
  item: ItemRequest;
}) => {
  const correctlyProcessedItemForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: validBody.item.name,
    available: true,
    picture: validBody.item.picture || null,
    description: validBody.item.description || null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories:
          validBody.item.categories.AdultClothing?.subcategories ?? [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories:
          validBody.item.categories.ChildAndBaby?.subcategories ?? [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories:
          validBody.item.categories.HouseAndGarden?.subcategories ?? [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories:
          validBody.item.categories.MediaAndGames?.subcategories ?? [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: validBody.item.categories.Other?.subcategories ?? [],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories:
          validBody.item.categories.SportAndCamping?.subcategories ?? [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories:
          validBody.item.categories.Technology?.subcategories ?? [],
      },
    },
    dueDate: null,
    owner: true,
    interactions: [],
    ownerData: null,
    commonCommunity: null,
  };

  return correctlyProcessedItemForClient;
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
      // define create Test for valid bodies
      const createTest = async (createBody: { item: ItemRequest }) => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // for monitoring the test
        // // get users detail to extract myItems
        // const authResponse = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems before create', authResponse.body.myItems);

        //create item in DB
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send(createBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // for monitoring the test
        // // get users detail to extract myItems
        // const auth2Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after create', auth2Response.body.myItems);

        // delete just created item from DB
        const itemId = createItemResponse.body[0]._id;
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // for monitoring the test
        // console.log('create test item is again deleted:', deleteItemResponse.text);

        // // get users detail to extract myItems
        // const auth3Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after delete', auth3Response.body.myItems);

        // logout
        await logout(connectSidValue);

        return [createItemResponse, deleteItemResponse];
      };

      describe('should respond successful with a statusCode200 and processedItem details (matching input) ', () => {
        // expect statements for all tests in this block
        const expectsForValidBody = (
          createBody: { item: ItemRequest },
          createItemResponse: request.Response,
          deleteItemResponse: request.Response,
        ) => {
          // expects
          // for item creation
          expect(createItemResponse.statusCode).toBe(200);

          // expect the body array to only have one object inside
          expect(createItemResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from validCreateBody
          const createdItem = createItemResponse.body[0];
          expect(createdItem).toEqual(
            checkResponseToBeCorrectlyProcessedItemForClient(createBody),
          );

          // expect
          // for successfully deleting created item
          expect(deleteItemResponse.text).toBe(
            `Successfully deleted item ${createdItem._id}!`,
          );

          // log for checking that all validation test ran completely
          // console.log('expectsForValidBody ran with', createBody.item.name);
        };

        // test function for all bodys in this block
        const testForValidBody = async (validCreateBody: {
          item: ItemRequest;
        }) => {
          // define Body to be used in this test
          const createBody = validCreateBody;

          // login Bodo4, let him create Item with passed in Body, delete Item again - return [createdItemResponse, deleteItemResponse]
          const createTestResponse = await createTest(createBody);

          // responses from createTest
          const createItemResponse = createTestResponse[0];
          // console.log('createItemResponse.body', createItemResponse.body);
          const deleteItemResponse = createTestResponse[1];
          // console.log('deleteItemResponse.text', deleteItemResponse.text);

          expectsForValidBody(
            createBody,
            createItemResponse,
            deleteItemResponse,
          );
        };

        // valid bodies given from client to be tested in this block

        // one subcategoy in one top category
        const validCreateBody: { item: ItemRequest } = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            name: 'Item from Create Test1 one subcategoy in one top category',
            description: 'This text describes the item made in the create test',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input with one category with one subcategory', async () => {
          await testForValidBody(validCreateBody);
        }, 10000);

        // mulitple subcategoies in one top category
        const validCreateBody2: { item: ItemRequest } = {
          item: {
            ...validCreateBody.item,
            name: 'Item from Create Test2 mulitple subcategoies in one top category',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
            },
          },
        };
        // test
        it('for complete input with one category with several subcategories', async () => {
          await testForValidBody(validCreateBody2);
        }, 10000);

        // multiple top categories
        const validCreateBody3: { item: ItemRequest } = {
          item: {
            ...validCreateBody.item,
            name: 'Item from Create Test3 multiple top categories',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
              ChildAndBaby: { subcategories: ['Spielzeug'] },
            },
          },
        };
        // test
        it('for complete input with several categories', async () => {
          await testForValidBody(validCreateBody3);
        }, 10000);

        // without picture
        const validCreateBody4: { item: ItemRequest } = {
          item: {
            name: 'Item from Create Test4 without picture',
            description: 'This text describes the item made in the test',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input without picture', async () => {
          await testForValidBody(validCreateBody4);
        }, 10000);

        // without description
        const validCreateBody5: { item: ItemRequest } = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            name: 'Item from Create Test5 without description',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input without description', async () => {
          await testForValidBody(validCreateBody5);
        }, 10000);

        // without picture and description
        const validCreateBody6: { item: ItemRequest } = {
          item: {
            name: 'Item from Create Test6 without picture and description',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input without picture and description', async () => {
          await testForValidBody(validCreateBody6);
        }, 10000);
      });

      it('should push item to owner.myItems', async () => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        //create item in DB
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing if item._id is pushed to owner.myItems',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
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
      describe('should respond error with a statusCode400', () => {
        // tests for no category and/or no name and/or empty item object

        // expect statements for all tests in this block
        const expectsForInvalidBody = (
          invalidity: string,
          createItemResponse: request.Response,
        ) => {
          // console.log(createItemResponse.statusCode, createItemResponse.error);

          // expects
          expect(createItemResponse.statusCode).toBe(400);
          expect(createItemResponse.text).toContain('at validateItem');
          expect(createItemResponse.text).toContain(invalidity);

          // log for checking that all validation test ran completely
          // console.log('expectsForInvalidBody ran for invalidity', invalidity);
        };

        // test function for all bodys in this block
        const testForInvalidBody = async (
          invalidity: string,
          invalidCreateBody: any,
        ) => {
          // define Body to be used in this test
          const createBody = invalidCreateBody;

          // login Bodo4, let him create Item with passed in Body
          const connectSidValue = await loginBodo4();
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send(createBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // no delete request necessary, cause invalid body won't create an item

          expectsForInvalidBody(invalidity, createItemResponse);
        };

        // invalid bodies given from client to be tested in this block

        // empty object
        const invalidCreateBody1 = {
          // item: {
          // name: 'Item from Test1',
          // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          // },
        };
        // test
        it('for empty body object', async () => {
          await testForInvalidBody(
            'Error: &quot;item&quot; is required',
            invalidCreateBody1,
          );
        }, 10000);

        // without name
        const invalidCreateBody2 = {
          item: {
            // name: 'Item from Test1 without name',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for missing name', async () => {
          await testForInvalidBody(
            'Error: &quot;item.name&quot; is required',
            invalidCreateBody2,
          );
        }, 10000);

        // without category
        const invalidCreateBody3 = {
          item: {
            name: 'Item from Test3',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for missing category', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories&quot; is required',
            invalidCreateBody3,
          );
        }, 10000);

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
        // test
        it('for missing subcategories', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories.HouseAndGarden.subcategories&quot; is required',
            invalidCreateBody4,
          );
        }, 10000);

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
        // test
        it('for empty subcategory', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories.HouseAndGarden.subcategories&quot; must contain at least 1 items',
            invalidCreateBody5,
          );
        }, 10000);

        // without name and category
        const invalidCreateBody6 = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            // name: 'Item from Test4',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for missing name and category', async () => {
          await testForInvalidBody(
            'Error: &quot;item.name&quot; is required',
            invalidCreateBody6,
          );
        }, 10000);

        // empty item
        const invalidCreateBody7 = {
          item: {
            // name: 'Item from Test4',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for empty item object', async () => {
          await testForInvalidBody(
            'Error: &quot;item.name&quot; is required',
            invalidCreateBody7,
          );
        }, 10000);

        // not defined category
        const invalidCreateBody8 = {
          item: {
            name: 'Item from Test8',
            categories: {
              SomeNotExistingTopCategory: { subcategories: ['Deko'] },
            },
          },
        };
        // test
        it('for not defined category', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories.SomeNotExistingTopCategory&quot; is not allowed',
            invalidCreateBody8,
          );
        }, 10000);

        // invalid additional field inside item
        const invalidCreateBody9 = {
          item: {
            name: 'Item from Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
            color: 15,
          },
        };
        // test
        it('for additional field inside item', async () => {
          await testForInvalidBody(
            'Error: &quot;item.color&quot; is not allowed',
            invalidCreateBody9,
          );
        }, 10000);

        // invalid additional field alongside item
        const invalidCreateBody10 = {
          item: {
            name: 'Item from Test3',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
          color: [25, 57],
        };
        // test
        it('for additional field alongside item', async () => {
          await testForInvalidBody(
            'Error: &quot;color&quot; is not allowed',
            invalidCreateBody10,
          );
        }, 10000);

        // not defined subcategory
        const invalidCreateBody11 = {
          item: {
            name: 'Item from Test11',
            categories: {
              HouseAndGarden: { subcategories: ['SomeNotExistingSubcategory'] },
            },
          },
        };
        // test
        it('for not defined subcategory', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories.HouseAndGarden.subcategories[0]&quot; must be one of [Baustellengeräte, Deko, Gartengeräte, Garten- und Partymoebel, Haushalts- und Küchengeräte, Schutzkleidung, Werkzeuge, Sonstiges, Kleidung, Spielzeug, Zubehör, Bücher, Gesellschaftsspiele (Brett- und Kartenspiele), Fachbücher (Schule und Studium), Filme, Videospiele, Damenkleidung, Damenschuhe, Herrenkleidung, Herrenschuhe, Campingutensilien, Fitnessgeräte, Outdoorkleidung, Wintersport, Audio &amp; Hifi, Computer und Zubehör, Kameras und Zubehör, Konsolen, TV, Beamer und Zubehör]',
            invalidCreateBody11,
          );
        }, 10000);
      });

      describe('should respond error with a statusCode500', () => {
        // expect statements for all tests in this block
        const expectsForInvalidBody = (
          invalidity: string,
          createItemResponse: request.Response,
        ) => {
          // console.log(createItemResponse.statusCode, createItemResponse.error);

          // expects
          expect(createItemResponse.statusCode).toBe(500);
          expect(createItemResponse.text).toContain('at model.Object');
          expect(createItemResponse.text).toContain(invalidity);

          // log for checking that all validation test ran completely
          // console.log('expectsForInvalidBody ran for invalidity', invalidity);
        };

        // test function for all bodys in this block
        const testForInvalidBody = async (
          invalidity: string,
          invalidCreateBody: any,
        ) => {
          // define Body to be used in this test
          const createBody = invalidCreateBody;

          // login Bodo4, let him create Item with passed in Body
          const connectSidValue = await loginBodo4();
          const createItemResponse = await request(app)
            .post(itemRoute)
            .send(createBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // no delete request necessary, cause invalid body won't create an item

          expectsForInvalidBody(invalidity, createItemResponse);
        };

        // invalid body given from client to be tested in this block

        // wrongly paired top and subcategory
        const invalidCreateBody = {
          item: {
            name: 'Item from Test of wrongly paired top and subcategory',
            categories: {
              HouseAndGarden: { subcategories: ['Konsolen'] },
            },
          },
        };
        // test
        it('for wrongly paired top and subcategory', async () => {
          await testForInvalidBody(
            'ValidationError: Item validation failed: categories.HouseAndGarden.subcategories.0: `Konsolen` is not a valid enum value for path `categories.HouseAndGarden.subcategories.0`.',
            invalidCreateBody,
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
      ]).toEqual(expect.arrayContaining([deleteAllOfUsersItemsResponse.text]));

      console.log('all tests in itemRoutesPOST-createItem.test.ts ran');
    }, 10000);
  });
});
