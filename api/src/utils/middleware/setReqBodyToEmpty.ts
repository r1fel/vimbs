// Middleware for requests, where a body could be sent, but it's supposed to be empty
import { Request, Response, NextFunction } from 'express';

const setReqBodyToEmpty = (req: Request, res: Response, next: NextFunction) => {
  console.log('before', req.body);
  req.body = {};
  console.log('after', req.body);
  return next();
};

export default setReqBodyToEmpty;
