// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const userAuthSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export default userAuthSchema;
