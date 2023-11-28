import { Request } from 'express';

export const isAuthenticated = (req: Request) => {
  console.log('authenicated ran');
  return req.isAuthenticated();
};
