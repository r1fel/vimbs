import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import { ItemRequest } from '../../src/typeDefinitions';

const app = makeApp(database);

// routes
const loginRoute = '/auth/login';
const logoutRoute = '/auth/logout';
const authRoute = '/auth';

const itemRoute = '/item';
const itemIdRoute = '/item/:itemId';

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

const loginUser = async ({
  email: email,
  password: password,
}: {
  email: string;
  password: string;
}) => {
  const loginBodo4Response = await request(app).post(loginRoute).send({
    email: email,
    password: password,
  });
  // Access the headers and get the 'set-cookie' header
  const setCookieHeader = loginBodo4Response.headers['set-cookie'];
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

const invalidConnectSidValue =
  's%3AnFsjM4XUm0O8fA0JrqIKBQFDjTOp538v.uJgEmwcCkUfu1fIRpleL0DTM58naHwgEzD5gDw%2B82tY';

// pass in the route which is protected by the isLoggedIn middleware
// test, that middleware is doing it's route protecting properly
const notPassedIsLoggedIn = (route: string) => {
  describe('when isLoggedIn was not passed', () => {
    it('should respond error with a statusCode401 if req.user undefined', async () => {
      const response = await request(app).post(route);

      expect(response.statusCode).toBe(401);
    });
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await request(app)
        .post(route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      expect(response.statusCode).toBe(401);
    });
  });
};

// TESTS

describe('POST /item (createItem)', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  // check if isLoggedIn throws appropriate errors
  notPassedIsLoggedIn(itemRoute);

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
          .send(validCreateBody)
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
                validCreateBody.item.categories.AdultClothing?.subcategories ??
                [],
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
                validCreateBody.item.categories.HouseAndGarden?.subcategories ??
                [],
            },
            MediaAndGames: {
              name: 'Medien und Spiele',
              subcategories:
                validCreateBody.item.categories.MediaAndGames?.subcategories ??
                [],
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
                validCreateBody.item.categories.Technology?.subcategories ?? [],
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
          .send(validCreateBody)
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
                validCreateBody.item.categories.AdultClothing?.subcategories ??
                [],
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
                validCreateBody.item.categories.HouseAndGarden?.subcategories ??
                [],
            },
            MediaAndGames: {
              name: 'Medien und Spiele',
              subcategories:
                validCreateBody.item.categories.MediaAndGames?.subcategories ??
                [],
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
                validCreateBody.item.categories.Technology?.subcategories ?? [],
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
        .send(validCreateBody)
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

        expect(createItemResponse.statusCode).toBe(400);
        expect(createItemResponse.statusCode).not.toBe(200);

        // TODO: make this test better by e.g. spying on validateItem middleware, to see that the error was thrown here
        // comment on TODO: by printing out the createItemResponse,
        // I could not easily determine some response paramerter that could easily be used for this
      }
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

        expect(createItemResponse.statusCode).toBe(400);
        expect(createItemResponse.statusCode).not.toBe(200);

        // TODO: make this test better by e.g. spying on validateItem middleware, to see that the error was thrown here
        // comment on TODO: by printing out the createItemResponse,
        // I could not easily determine some response paramerter that could easily be used for this
      }
      // logout
      await logout(connectSidValue);
    }, 10000);
  });
});

// describe('DELETE /item/:itemId', () => {
//   describe('when isLoggedIn was not passed', () => {
//     it('should respond error with a statusCode401 if req.user undefined', async () => {
//       //
//     });
//     it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
//       //
//     });
//   });
// describe('when isOwner was not passed', () => {
//   describe('when valid itemId is given', () => {
//     it('should respond error with a statusCode403 if user is not item.owner', async () => {
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
//   describe('when existing itemId is given', () => {
//     it('should respond successful with a statusCode200 if user is the item.owner', async () => {
//       //
//     });
//     it('should delete item from DB', async () => {
//       //
//     });
//     it('should pull item from owner.myInventory', async () => {
//       //
//     });
//     // TODO ER: it should in the future set a bool of deleted to true on item, so that it can be shown for users having item in watchlist etc
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

// describe('PUT /item/:itemId (updateItem)', () => {
//   describe('when isLoggedIn was not passed', () => {
//     it('should respond error with a statusCode401 if req.user undefined', async () => {
//       //
//     });
//     it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
//       //
//     });
//   });
//   describe('when isOwner was not passed', () => {
//     describe('when valid itemId is given', () => {
//       it('should respond error with a statusCode403 if user is not item.owner', async () => {
//         //
//       });
//     });
//     describe('when invalid itemId is given', () => {
//       it('should respond error with a statusCode400 for not existing itemId', async () => {
//         // id has correct pattern, but item doesnt exist
//       });
//       it('should respond error with a statusCode500 for itemId value that could not be cast to ObjectId', async () => {
//         // for id values that are not valid mongo id values
//       });
//     });
//   });
//     // see createItem-Test
//     describe('and when body given', () => {
//       // define correct body (with only one category)
//       it('should respond successful with a statusCode200 and processedItem details if user is item.owner, for complete input with one or more categories', async () => {
//         // change category input to include several categories - test defined above and modified
//       });
//       it('should respond successful with a statusCode200 and processedItem details if user is item.owner, for left out picture and/or description', async () => {
//         // change correct body to a) include no pic, b) include no description, c) include neither
//       });
//       it('should set req.body.item as item details for valid request', async () => {
//         //
//       });
//       it('should save item/changes for valid request', async () => {
//         //
//       });
//       it('should respond error with a statusCode400 for no category and/or no name and/or empty item object', async () => {
//         // change correct body to a) include no name, b) include no category, c) include neither, d) empty item: {}
//       });
// it('should respond error with a statusCode400 for invalid field(s)', async () => {
//   // add field(s) to inout
// });
//     });
//     describe('when NO body given', () => {
//       it('should respond error with a statusCode400 for empty body', async () => {
//         //send without body
//       });
//     });
// });

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
describe.skip('dummy', () => {
  describe('when dummytest given', () => {
    it('should be happy ', async () => {
      expect(true).toBe(true);
    });
  });
});
