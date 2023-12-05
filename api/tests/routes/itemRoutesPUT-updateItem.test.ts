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
  itemIdRoute,
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

        // console.log('expect 403:', response.statusCode, response.text);
        // expect route in question to throw 403
        expect(response.statusCode).toBe(403);
        expect(response.text).toContain(
          'Error: Forbidden: You do not have permission to do that!',
        );

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

        // console.log('expect 400:', response.statusCode, response.text);
        // expect route in question to throw 400
        expect(response.statusCode).toBe(400);
        expect(response.text).toContain(
          'Error: Bad Request: This item does not exist',
        );

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

          // console.log('expect 500:', response.statusCode, response.text);
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

  describe(`PUT ${itemIdRoute} (updateItem)`, () => {
    // check if isLoggedIn throws appropriate errors
    notPassedIsLoggedIn('put', `${itemRoute}/65673cc5811318fde3968147`);

    notPassedIsOwner('put', itemRoute); // can only pass itemRoute and not item/:itemId because itemId is created in function

    describe('when valid body given', () => {
      // define update Test for valid bodies
      const updateTest = async (updateBody: { item: ItemRequest }) => {
        //  login Bodo4
        const connectSidValue = await loginBodo4();

        // for monitoring the test
        // // get users detail to extract myItems
        // const authResponse = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems before update', authResponse.body.myItems);

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

        // for monitoring the test
        // // get users detail to extract myItems
        // const auth2Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after update', auth2Response.body.myItems);

        //update item in DB
        const updateItemResponse = await request(app)
          .put(`${itemRoute}/${itemId}`)
          .send(updateBody)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // delete just created and updated item from DB
        const deleteItemResponse = await request(app)
          .delete(`${itemRoute}/${itemId}`)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // for monitoring the test
        // console.log(
        //   'update test item is again deleted:',
        //   deleteItemResponse.text,
        // );

        // // get users detail to extract myItems
        // const auth3Response = await request(app)
        //   .get(authRoute)
        //   .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // // extract myItems array
        // console.log('myItems after delete', auth3Response.body.myItems);

        // logout
        await logout(connectSidValue);

        return [updateItemResponse, deleteItemResponse];
      };

      describe('should respond successful with a statusCode200 and processedItem details (matching input) ', () => {
        // expect statements for all tests in this block
        const expectsForValidBody = (
          updateBody: { item: ItemRequest },
          updateItemResponse: request.Response,
          deleteItemResponse: request.Response,
        ) => {
          // expects
          // for item creation
          expect(updateItemResponse.statusCode).toBe(200);

          // expect the body array to only have one object inside
          expect(updateItemResponse.body).toHaveLength(1);

          // expect the body[0] to resemble the data inputs from validUpdateBody
          const updatedItem = updateItemResponse.body[0];
          expect(updatedItem).toEqual(
            checkResponseToBeCorrectlyProcessedItemForClient(updateBody),
          );

          // expect
          // for successfully deleting updated item
          expect(deleteItemResponse.text).toBe(
            `Successfully deleted item ${updatedItem._id}!`,
          );

          // log for checking that all validation test ran completely
          // console.log('expectsForValidBody ran with', updateBody.item.name);
        };

        // test function for all bodys in this block
        const testForValidBody = async (validUpdateBody: {
          item: ItemRequest;
        }) => {
          // define Body to be used in this test
          const updateBody = validUpdateBody;

          // login Bodo4, let him update Item with passed in Body, delete Item again - return [updatedItemResponse, deleteItemResponse]
          const updateTestResponse = await updateTest(updateBody);

          // responses from updateTest
          const updateItemResponse = updateTestResponse[0];
          // console.log('updateItemResponse.body', updateItemResponse.body);
          const deleteItemResponse = updateTestResponse[1];
          // console.log('deleteItemResponse.text', deleteItemResponse.text);

          expectsForValidBody(
            updateBody,
            updateItemResponse,
            deleteItemResponse,
          );
        };

        // valid bodies given from client to be tested in this block

        // one subcategoy in one top category
        const validUpdateBody: { item: ItemRequest } = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            name: 'Item from Update Test1 one subcategoy in one top category',
            description: 'This text describes the item made in the Update test',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input with one category with one subcategory', async () => {
          await testForValidBody(validUpdateBody);
        }, 10000);

        // mulitple subcategoies in one top category
        const validUpdateBody2: { item: ItemRequest } = {
          item: {
            ...validUpdateBody.item,
            name: 'Item from Update Test2 mulitple subcategoies in one top category',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
            },
          },
        };
        // test
        it('for complete input with one category with several subcategories', async () => {
          await testForValidBody(validUpdateBody2);
        }, 10000);

        // multiple top categories
        const validUpdateBody3: { item: ItemRequest } = {
          item: {
            ...validUpdateBody.item,
            name: 'Item from Update Test3 multiple top categories',
            categories: {
              HouseAndGarden: { subcategories: ['Deko', 'Gartengeräte'] },
              ChildAndBaby: { subcategories: ['Spielzeug'] },
            },
          },
        };
        // test
        it('for complete input with several categories', async () => {
          await testForValidBody(validUpdateBody3);
        }, 10000);

        // without picture
        const validUpdateBody4: { item: ItemRequest } = {
          item: {
            name: 'Item from Update Test4 without picture',
            description: 'This text describes the item made in the test',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input without picture', async () => {
          await testForValidBody(validUpdateBody4);
        }, 10000);

        // without description
        const validUpdateBody5: { item: ItemRequest } = {
          item: {
            picture:
              'https://tse3.mm.bing.net/th?id=OIP.oEx-B2I_HoNDO9BThaRzKwHaFx&pid=Api',
            name: 'Item from Update Test5 without description',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input without description', async () => {
          await testForValidBody(validUpdateBody5);
        }, 10000);

        // without picture and description
        const validUpdateBody6: { item: ItemRequest } = {
          item: {
            name: 'Item from Update Test6 without picture and description',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for complete input without picture and description', async () => {
          await testForValidBody(validUpdateBody6);
        }, 10000);
      });
    });

    describe('when invalid body given', () => {
      // name and category are required in the Joi validation schema (see src/utils/middleware/schemas), as should there by an item object
      // all these required fields are now tested
      describe('should respond error with a statusCode400', () => {
        // tests for no category and/or no name and/or empty item object

        // expect statements for all tests in this block
        const expectsForInvalidBody = (
          invalidity: string,
          updateItemResponse: request.Response,
        ) => {
          // console.log(updateItemResponse.statusCode, updateItemResponse.error);

          // expects
          expect(updateItemResponse.statusCode).toBe(400);
          expect(updateItemResponse.text).toContain('at validateItem');
          expect(updateItemResponse.text).toContain(invalidity);

          // log for checking that all validation test ran completely
          // console.log('expectsForInvalidBody ran for invalidity', invalidity);
        };

        // test function for all bodys in this block
        const testForInvalidBody = async (
          invalidity: string,
          invalidUpdateBody: any,
        ) => {
          // define Body to be used in this test
          const updateBody = invalidUpdateBody;

          // login Bodo4, let him create Item with passed in Body
          const connectSidValue = await loginBodo4();

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

          //update item in DB
          const updateItemResponse = await request(app)
            .put(`${itemRoute}/${itemId}`)
            .send(updateBody)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          expectsForInvalidBody(invalidity, updateItemResponse);
        };

        // invalid bodies given from client to be tested in this block

        // empty object
        const invalidUpdateBody1 = {
          // item: {
          // name: 'Item from Test1',
          // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          // },
        };
        // test
        it('for empty body object', async () => {
          await testForInvalidBody(
            'Error: &quot;item&quot; is required',
            invalidUpdateBody1,
          );
        }, 10000);

        // without name
        const invalidUpdateBody2 = {
          item: {
            // name: 'Item from Test1 without name',
            categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for missing name', async () => {
          await testForInvalidBody(
            'Error: &quot;item.name&quot; is required',
            invalidUpdateBody2,
          );
        }, 10000);

        // without category
        const invalidUpdateBody3 = {
          item: {
            name: 'Item from Test3',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for missing category', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories&quot; is required',
            invalidUpdateBody3,
          );
        }, 10000);

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
        // test
        it('for missing subcategories', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories.HouseAndGarden.subcategories&quot; is required',
            invalidUpdateBody4,
          );
        }, 10000);

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
        // test
        it('for empty subcategory', async () => {
          await testForInvalidBody(
            'Error: &quot;item.categories.HouseAndGarden.subcategories&quot; must contain at least 1 items',
            invalidUpdateBody5,
          );
        }, 10000);

        // without name and category
        const invalidUpdateBody6 = {
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
            invalidUpdateBody6,
          );
        }, 10000);

        // empty item
        const invalidUpdateBody7 = {
          item: {
            // name: 'Item from Test4',
            // categories: { HouseAndGarden: { subcategories: ['Deko'] } },
          },
        };
        // test
        it('for empty item object', async () => {
          await testForInvalidBody(
            'Error: &quot;item.name&quot; is required',
            invalidUpdateBody7,
          );
        }, 10000);

        // not defined category
        const invalidUpdateBody8 = {
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
            invalidUpdateBody8,
          );
        }, 10000);

        // invalid additional field inside item
        const invalidUpdateBody9 = {
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
            invalidUpdateBody9,
          );
        }, 10000);

        // invalid additional field alongside item
        const invalidUpdateBody10 = {
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
            invalidUpdateBody10,
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

      // ! ER: Adjust validate Item to make an error in this case!!!
      // describe('should respond error with a statusCode500', () => {
      //   // expect statements for all tests in this block
      //   const expectsForInvalidBody = (
      //     invalidity: string,
      //     updateItemResponse: request.Response,
      //   ) => {
      //     // console.log(updateItemResponse.statusCode, updateItemResponse.error);

      //     // expects
      //     expect(updateItemResponse.statusCode).toBe(500);
      //     expect(updateItemResponse.text).toContain('at model.Object');
      //     expect(updateItemResponse.text).toContain(invalidity);

      //     // log for checking that all validation test ran completely
      //     console.log('expectsForInvalidBody ran for invalidity', invalidity);
      //   };

      //   // test function for all bodys in this block
      //   const testForInvalidBody = async (
      //     invalidity: string,
      //     invalidUpdateBody: any,
      //   ) => {
      //     // define Body to be used in this test
      //     const updateBody = invalidUpdateBody;

      //     // login Bodo4, let him create and update Item with passed in Body
      //     const connectSidValue = await loginBodo4();

      //     const createItemResponse = await request(app)
      //       .post(itemRoute)
      //       .send({
      //         item: {
      //           name: 'Item for testing PUT Route',
      //           categories: { Other: { subcategories: ['Sonstiges'] } },
      //         },
      //       })
      //       .set('Cookie', [`connect.sid=${connectSidValue}`]);
      //     // extract itemId
      //     const itemId = createItemResponse.body[0]._id;

      //     //update item in DB
      //     const updateItemResponse = await request(app)
      //       .put(`${itemRoute}/${itemId}`)
      //       .send(updateBody)
      //       .set('Cookie', [`connect.sid=${connectSidValue}`]);

      //     expectsForInvalidBody(invalidity, updateItemResponse);
      //   };

      //   // invalid body given from client to be tested in this block

      //   // wrongly paired top and subcategory
      // const invalidCreateBody = {
      //   item: {
      //     name: 'Item from Test of wrongly paired top and subcategory',
      //     categories: {
      //       HouseAndGarden: { subcategories: ['Konsolen'] },
      //     },
      //   },
      // };
      // // test
      // it('for wrongly paired top and subcategory', async () => {
      //   await testForInvalidBody(
      //     'ValidationError: Item validation failed: categories.HouseAndGarden.subcategories.0: `Konsolen` is not a valid enum value for path `categories.HouseAndGarden.subcategories.0`.',
      //     invalidCreateBody,
      //   );
      // }, 10000);
      // });
    });
  });
});

console.log('all tests in itemRoutesPUT-updateItem.test.ts ran');
