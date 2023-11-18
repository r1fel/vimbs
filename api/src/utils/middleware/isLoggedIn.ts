// Middleware to check wether the user sending the request is logged in
import { Request, Response, NextFunction } from 'express';

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    console.log(
      'Checking authentication status not successful:',
      req.isAuthenticated()
    );
    return res.redirect(`${process.env.CLIENT_URL}/auth`);
    // return res.send(false);
  }
  console.log(
    'Checking authentication status successful:',
    req.isAuthenticated()
  );
  return next();
};

export default isLoggedIn;
