import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import validateItem from '../../../src/utils/middleware/validateItem';
import itemSchema from '../../../src/utils/middleware/schemas/itemSchema';
import ExpressError from '../../../src/utils/ExpressError';

jest.mock('../../../src/utils/middleware/schemas/itemSchema');
jest.mock('../../../src/utils/ExpressError');

describe('validateItem middleware', () => {
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

  test('should call next if item data is valid', () => {
    // Mock the itemSchema.validate to return no error
    (itemSchema.validate as jest.Mock).mockReturnValueOnce({
      error: null,
    });

    // Call the middleware
    validateItem(req as Request, res as Response, next);

    // Check that next was called
    expect(next).toHaveBeenCalled();
    // Check that ExpressError constructor was not called
    expect(ExpressError).not.toHaveBeenCalled();
  });

  test('should call next with an error if item data is invalid', () => {
    // Mock the itemSchema.validate to return an error
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
        // Add more details as needed
      ],
      annotate: () => 'validation Error',
      _original: {},
    };
    (itemSchema.validate as jest.Mock).mockReturnValueOnce({
      error: validationError,
    });

    // Call the middleware
    validateItem(req as Request, res as Response, next);

    // Check that ExpressError constructor was called with the correct arguments
    expect(ExpressError).toHaveBeenCalledWith(validationError.message, 400);
    expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
  });
});
