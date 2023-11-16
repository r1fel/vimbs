// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const itemSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

export default itemSchema;
