describe('dummy', () => {
  describe('when dummytest given', () => {
    it('should be happy ', async () => {
      expect(true).toBe(true);
    });
  });
});

// describe('POST /item (createItem)', () => {
// describe('when isLoggedIn was not passed', () => {
//   it('should respond error with a statusCode401 if req.user undefined', async () => {
//     //
//   });
//   it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
//     //
//   });
// });
//   describe('when body given', () => {
//     // define correct body (with only one category)
//     it('should respond successful with a statusCode200 and processedItem details for complete input with one or more categories', async () => {
//       // change category input to include several categories - test defined above and modified
//     });
//     it('should respond successful with a statusCode200 and processedItem details for left out picture and/or description', async () => {
//       // change correct body to a) include no pic, b) include no description, c) include neither
//     });
//     it('should set req.user as item.owner for valid request', async () => {
//       //
//     });
//     it('should push item to owner.myItems for valid request', async () => {
//       //
//     });
//     it('should set req.body.item as item details for valid request', async () => {
//       //
//     });
//     it('should save item to DB for valid request', async () => {
//       //
//     });
//     it('should respond error with a statusCode400 for no category and/or no name and/or empty item object', async () => {
//       // change correct body to a) include no name, b) include no category, c) include neither, d) empty item: {}
//     });
// it('should respond error with a statusCode400 for invalid field(s)', async () => {
//   // add field(s) to inout
// });
//   });
//   describe('when NO body given', () => {
//     it('should respond error with a statusCode400 for empty body', async () => {
//       //send without body
//     });
//   });
// });

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
