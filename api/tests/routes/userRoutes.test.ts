describe('dummy', () => {
  describe('when dummytest given', () => {
    it('should be happy ', async () => {
      expect(true).toBe(true);
    });
  });
});

// describe('GET /user/:userId/inventory/myItems', () => {
// describe('when isLoggedIn was not passed', () => {
//   it('should respond error with a statusCode401 if req.user undefined', async () => {
//     //
//   });
//   it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
//     //
//   });
// });
// describe('when isUser was not passed', () => {
//   it('should respond error with a statusCode403 if req.user is not :userId', async () => {
//     //
//   });
// });
//   describe('when isLoggedIn was passed', () => {
//   it('should respond successful with a statusCode200 and processedItemData for user with items', async () => {
//   //
//   });
//   it('should respond successful with a statusCode200 and empty array for user with NO items', async () => {
//     //
//     });
//   });
// });

// describe('POST /user/:userId/changePassword', () => {
//   // reset password after every test
//   describe('when isLoggedIn was not passed', () => {
//     it('should respond error with a statusCode401 if req.user undefined', async () => {
//       //
//     });
//     it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
//       //
//     });
//   });
//   describe('when isUser was not passed', () => {
//     it('should respond error with a statusCode403 if req.user is not :userId', async () => {
//       //
//     });
//   });
//   // define valid input
//   describe('when changePassword body is given', () => {
//     it('should respond successful with a statusCode200 and user data for valid old and new password', async () => {
//       //
//     });
//     it('should respond error with a statusCode400 for old and new passwords being equal', async () => {
//       // change input to equal pws
//     });
//     it('should respond error with a statusCode400 for only old or new password given', async () => {
//       // change input to a) only old given, b) only new given
//     });
// it('should respond error with a statusCode400 for invalid field(s)', async () => {
//   // add field(s) to inout
// });
//     it('should respond error with a statusCode500 for old password being incorrect', async () => {
//       // change input to having wrong old password
//     });
//   });
//   describe('when changePassword body is NOT given', () => {
//     it('should respond error with a statusCode400 for empty body', async () => {
//       // change input to empty
//     });
//   });
// });

// describe('PUT /user/:userId/settings', () => {
//   describe('when isLoggedIn was not passed', () => {
//     it('should respond error with a statusCode401 if req.user undefined', async () => {
//       //
//     });
//     it('should respond error with a statusCode401 if req.user but no ongoing session', async () => {
//       //
//     });
//   });
//   describe('when isUser was not passed', () => {
//     it('should respond error with a statusCode403 if req.user is not :userId', async () => {
//       //
//     });
//   });
//   // define valid input
//   describe('when newUserData body is given', () => {
//     it('should respond successful with a statusCode200 and user data for input including a newUserData Object', async () => {
//       //
//     });
//     it('should respond successful with a statusCode200 and user data for input including any of the optional newUserData fields firstName, lastName, phone, adress', async () => {
//       // change input to include any only one and some combinations
//     });
//     it('should respond error with a statusCode400 for invalid field(s)', async () => {
//       // add field(s) to input
//     });
//   });
//   describe('when newUserData body is NOT given', () => {
//     it('should respond error with a statusCode400 for empty body', async () => {
//       // change input to empty
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

      console.log('all tests in userRoutes.test.ts ran');
    }, 10000);
  });
});
