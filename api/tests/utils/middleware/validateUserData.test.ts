import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import validateUserData from '../../../src/utils/middleware/validateUserData';
import userDataSchema from '../../../src/utils/middleware/schemas/userDataSchema';
import ExpressError from '../../../src/utils/ExpressError';

jest.mock('../../../src/utils/middleware/schemas/userDataSchema');
jest.mock('../../../src/utils/ExpressError');

describe('validateUserData middleware', () => {
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

  test('should call next if userData is valid', () => {
    // Mock the userDataSchema.validate to return no error
    (userDataSchema.validate as jest.Mock).mockReturnValueOnce({ error: null });

    // Call the middleware
    validateUserData(req as Request, res as Response, next);

    // Check that next was called
    expect(next).toHaveBeenCalled();
    // Check that ExpressError constructor was not called
    expect(ExpressError).not.toHaveBeenCalled();
  });

  test('should call next with an error if userData is invalid', () => {
    // Mock the userDataSchema.validate to return an error
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
    (userDataSchema.validate as jest.Mock).mockReturnValueOnce({
      error: validationError,
    });

    // Call the middleware
    validateUserData(req as Request, res as Response, next);

    // Check that ExpressError constructor was called with the correct arguments
    expect(ExpressError).toHaveBeenCalledWith(validationError.message, 400);
    expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
  });
});
