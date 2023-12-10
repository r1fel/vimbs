import { Request, Response, NextFunction } from 'express';
import isLoggedIn from '../../../src/utils/middleware/isLoggedIn';
import ExpressError from '../../../src/utils/ExpressError';

jest.mock('../../../src/utils/ExpressError');
jest.mock('express');

describe('isLoggedIn middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      isAuthenticated: jest.fn(),
    };
    res = {
      send: jest.fn(),
    };
    next = jest.fn();
  });

  test('should call next if user is authenticated', () => {
    // Mock isAuthenticated to return true
    (req.isAuthenticated as jest.Mock).mockReturnValueOnce(true);

    // Call the middleware
    isLoggedIn(req as Request, res as Response, next);

    // Check that next was called
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(ExpressError));
    expect(ExpressError).not.toHaveBeenCalled();
  });

  test('should send statusCode401 if user is not authenticated', () => {
    // Mock isAuthenticated to return false
    (req.isAuthenticated as jest.Mock).mockReturnValueOnce(false);

    // Call the middleware
    isLoggedIn(req as Request, res as Response, next);

    // Check that it returns an ExpressError with status 401
    expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    expect(ExpressError).toHaveBeenCalledWith('Unauthorized', 401);
  });
});
