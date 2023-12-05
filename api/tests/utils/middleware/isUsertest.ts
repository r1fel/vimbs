import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import isUser from '../../../src/utils/middleware/isUser';
import ExpressError from '../../../src/utils/ExpressError';

jest.mock('../../../src/utils/ExpressError');

describe('isUser middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      user: { _id: new mongoose.Types.ObjectId('65553888ac436ca1c6654129') }, // Mock the user object with _id
      params: {
        userId: new mongoose.Types.ObjectId(
          '65553888ac436ca1c6654129',
        ).toString(),
      }, // Mock the userId parameter
    };
    res = {};
    next = jest.fn();
  });

  test('should call next if the requesting user is the same as the user in the path', () => {
    // use both userIds to be as defined above

    isUser(req as Request, res as Response, next);

    // Check that next was called
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(ExpressError));
    expect(ExpressError).not.toHaveBeenCalled();
  });

  test('should return an ExpressError with status 500 if req.user is undefined', () => {
    // Set req.user to undefined
    req.user = undefined;

    isUser(req as Request, res as Response, next);

    // Check that it returns an ExpressError with status 500
    expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    expect(ExpressError).toHaveBeenCalledWith('user is undefined', 500);
  });

  test('should return an ExpressError with status 403 if the requesting user is different from the user in the path', () => {
    // Set req.params.userId to a different user ID
    req.params = {
      userId: new mongoose.Types.ObjectId(
        '66553888ac436ca1c6654129',
      ).toString(),
    };

    isUser(req as Request, res as Response, next);

    // Check that it returns an ExpressError with status 403
    expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    expect(ExpressError).toHaveBeenCalledWith(
      'Unauthorized: You are not allowed to view this content!',
      403,
    );
  });
});
