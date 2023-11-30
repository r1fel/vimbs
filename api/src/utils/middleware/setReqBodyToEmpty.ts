// Middleware for requests, where a body could be sent, but it's supposed to be empty
import { Request, Response, NextFunction } from 'express';

const setReqBodyToEmpty = (req: Request, res: Response, next: NextFunction) => {
  req.body = {};
  return next();
};

export default setReqBodyToEmpty;
