// TODO ER: i need to know how to successfully mock responses from mongo,
//  before I can make this work

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import isOwner from '../../../src/utils/middleware/isOwner';
import ExpressError from '../../../src/utils/ExpressError';
import catchAsync from '../../../src/utils/catchAsync';
import Item from '../../../src/models/item';
import { ItemInDB } from '../../../src/typeDefinitions';

jest.mock('mongoose');
jest.mock('../../../src/utils/middleware/isOwner');
jest.mock('../../../src/utils/ExpressError');
jest.mock('../../../src/utils/catchAsync');
jest.mock('../../../src/models/item');

describe('isOwner middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      user: { _id: new mongoose.Types.ObjectId('65553888ac436ca1c6654129') },
      params: {
        itemId: new mongoose.Types.ObjectId(
          '6553bc9a22932b85d2937a53',
        ).toString(),
      },
    };
    res = {};
    next = jest.fn();
  });

  // TODO ER: fix test. its not working because
  // a) when wrapping is owner in catch async throws an error
  // b) mocking the response from Item.find wont work
  // test('should call next if the user is the owner of the item', async () => {
  //   req.user = {
  //     _id: new mongoose.Types.ObjectId('6544bd2fdf354e46068d74c3'),
  //   };
  //   // define item found in DB
  //   const item: ItemInDB = {
  //     picture:
  //       'https://tse4.mm.bing.net/th?id=OIP.ZHDqYPQRKrob4g-Efci9rwHaIM&pid=Api',
  //     name: 'Pflanze',
  //     description:
  //       'Lorem ipsum dolor sit amet consectetur adipisicing elit',
  //     creationDate: new Date('2023-11-16T11:42:55.615Z'),
  //     owner: req.user._id,
  //     interactions: [],
  //     available: true,
  //   };
  //   // // Mock the Item.findById method to return an item with the same owner
  //   (Item.findById as jest.Mock).mockResolvedValueOnce(item);

  //   // Call the middleware
  //   const response = await isOwner(req as Request, res as Response, next);
  //   console.log(response);
  //   // Check that next was called
  //   expect(next).toHaveBeenCalled();
  //   // Check that ExpressError constructor was not called
  //   expect(ExpressError).not.toHaveBeenCalled();
  // });

  // test('should return an ExpressError with status 500 if item is not found', async () => {
  //   // Mock the Item.findById method to return null (item not found)
  //   (Item.findById as jest.Mock).mockReturnValue(null);

  //   // Call the middleware
  //   await isOwner(req as Request, res as Response, next);

  //   // Check that it returns an ExpressError with status 500
  //   expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
  //   expect(ExpressError).toHaveBeenCalledWith('this item doesnt exist', 500);
  // });

  // test('should return an ExpressError with status 403 if the user is not the owner of the item', async () => {
  //   // Mock the Item.findById method to return an item with a different owner
  //   (Item.findById as jest.Mock).mockResolvedValueOnce({
  //     owner: new mongoose.Types.ObjectId(),
  //   } as ItemInDB);

  //   // Call the middleware
  //   await isOwner(req as Request, res as Response, next);

  //   // Check that it returns an ExpressError with status 403
  //   expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
  //   expect(ExpressError).toHaveBeenCalledWith(
  //     'You do not have permission to do that!',
  //     403
  //   );
  // });

  // test('should return an ExpressError with status 500 if req.user is undefined', async () => {
  //   // Set req.user to undefined
  //   req.user = undefined;

  //   // Call the middleware
  //   await isOwner(req as Request, res as Response, next);

  //   // Check that it returns an ExpressError with status 500
  //   expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
  //   expect(ExpressError).toHaveBeenCalledWith('user is undefined', 500);
  // });
});
