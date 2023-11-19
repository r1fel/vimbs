import { Request, Response, NextFunction } from 'express';
import isLoggedIn from '../../../src/utils/middleware/isLoggedIn';

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
    // Check that res.send was not called
    expect(res.send).not.toHaveBeenCalled();
  });

  test('should send false if user is not authenticated', () => {
    // Mock isAuthenticated to return false
    (req.isAuthenticated as jest.Mock).mockReturnValueOnce(false);

    // Call the middleware
    isLoggedIn(req as Request, res as Response, next);

    // Check that next was not called
    expect(next).not.toHaveBeenCalled();
    // Check that res.send was called with false
    expect(res.send).toHaveBeenCalledWith(false);
  });
});
