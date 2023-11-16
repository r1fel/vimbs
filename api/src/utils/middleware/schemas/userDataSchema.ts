// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const userDataSchema = Joi.object({
  newUserData: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.object({
      countryCode: Joi.string(),
      number: Joi.number(),
    }).optional(),
    address: Joi.object({
      street: Joi.string(),
      plz: Joi.string(),
      city: Joi.string(),
    }).optional(),
  }).required(),
});

export default userDataSchema;
