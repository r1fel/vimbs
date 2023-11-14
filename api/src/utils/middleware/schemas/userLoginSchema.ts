// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const userRegisterSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export default userRegisterSchema;
