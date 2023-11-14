// wrap async functions with this generic function instead of using try catch
import {Request, Response, NextFunction} from 'express';

const catchAsync = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};

export default catchAsync;
