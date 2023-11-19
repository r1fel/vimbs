import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import validateUserAuth from '../../../src/utils/middleware/validateUserAuth';
import userAuthSchema from '../../../src/utils/middleware/schemas/userAuthSchema';
import ExpressError from '../../../src/utils/ExpressError';

jest.mock('../../../src/utils/middleware/schemas/userAuthSchema');
jest.mock('../../../src/utils/ExpressError');

describe('validateUserAuth middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {};
    next = jest.fn();
  });

  test('should call next if userAuthInput is valid', () => {
    // Mock the userAuthSchema.validate to return no error
    (userAuthSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });

    // Call the middleware
    validateUserAuth(req as Request, res as Response, next);

    // Check that next was called
    expect(next).toHaveBeenCalled();
    // Check that ExpressError constructor was not called
    expect(ExpressError).not.toHaveBeenCalled();
  });

  test('should call next with an error if userAuthInput is invalid', () => {
    // Mock the userAuthSchema.validate to return an error
    // this weird boilerplate code is needed to satisfy the Joi.Validation Error Type
    const validationError: Joi.ValidationError = {
      name: 'ValidationError',
      message: 'Error detail 1',
      isJoi: true,
      details: [
        {
          message: 'Error detail 1',
          path: ['field1'],
          type: 'string.base',
          context: { key: 'field1', label: 'Field 1', value: 'invalid value' },
        },
      ],
      annotate: () => 'validation Error',
      _original: {},
    };
    (userAuthSchema.validate as jest.Mock).mockReturnValueOnce({
      error: validationError,
    });

    // Call the middleware
    validateUserAuth(req as Request, res as Response, next);

    // Check that ExpressError constructor was called with the correct arguments
    expect(ExpressError).toHaveBeenCalledWith(validationError.message, 400);
    expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
  });
});
