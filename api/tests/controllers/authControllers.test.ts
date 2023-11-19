import { Request, Response, NextFunction } from 'express';
import ExpressError from '../../src/utils/ExpressError';
import { login, register } from '../../src/controllers/authControllers';
import User from '../../src/models/user';

jest.mock('../../src/models/user');

describe('authControllers', () => {
  describe('login', () => {
    test('should respond with user when login is successful', async () => {
      // Mock the request and response objects
      const req: Partial<Request> = { body: { email: 'test@example.com' } };
      const res: Partial<Response> = { send: jest.fn() };
      const next: NextFunction = jest.fn();

      // Mock the User.findOne method to return a user
      const mockUser = { _id: '123', email: 'test@example.com' };
      (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

      // Call the login function
      await login(req as Request, res as Response, next);

      // Check if the response was sent with the correct user
      expect(res.send).toHaveBeenCalledWith(mockUser);
      // Check that next was not called (no errors)
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    test('should call User.register and return next when registration is successful', async () => {
      // Mock the request, response, and next objects
      const req: Partial<Request> = {
        body: { email: 'test@example.com', password: 'password123' },
      };
      const res: Partial<Response> = {};
      const next: NextFunction = jest.fn();

      // Mock the User.register method
      // const mockUser = new User({
      //   email: 'test@example.com',
      // });
      // (User.register as jest.Mock).mockResolvedValueOnce(mockUser);

      // Call the register function
      await register(req as Request, res as Response, next);

      // Check if User.register was called with the correct arguments
      // TODO ER: user with mockUser instead of expect.any(User)
      expect(User.register).toHaveBeenCalledWith(
        expect.any(User),
        req.body.password,
      );
      // Check that next was called (no errors)
      expect(next).toHaveBeenCalled();
    });

    test('should call next with an error when registration fails', async () => {
      // Mock the request, response, and next objects
      const req: Partial<Request> = {
        body: { email: 'test@example.com', password: 'password123' },
      };
      const res: Partial<Response> = {};
      const next: NextFunction = jest.fn();

      // Mock the User.register method to throw an error
      const registerError = new Error('Registration failed');
      (User.register as jest.Mock).mockRejectedValueOnce(registerError);

      // Call the register function
      await register(req as Request, res as Response, next);

      // Check that next was called with the expected error
      expect(next).toHaveBeenCalledWith(
        new ExpressError('new user could not be created', 500),
      );
    });
  });
});
