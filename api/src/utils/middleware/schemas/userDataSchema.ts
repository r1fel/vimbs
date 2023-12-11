// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const userDataSchema = Joi.object({
  newUserData: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().allow('').required(),
    phone: Joi.object({
      countryCode: Joi.string()
        .pattern(/^\+\d{1,3}$/)
        .required(),
      number: Joi.string().pattern(/^\d*$/).min(9).max(11).allow('').required(),
    }).required(),
    address: Joi.object({
      street: Joi.string().allow('').required(),
      plz: Joi.string()
        .pattern(/^\d{5}$/)
        .allow('')
        .required(),
      city: Joi.string().allow('').required(),
    }).required(),
  }).required(),
});

export default userDataSchema;
