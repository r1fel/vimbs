// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const userDataSchema = Joi.object({
  newUserData: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().empty('').required(),
    phone: Joi.object({
      countryCode: Joi.string()
        .pattern(/^\+\d{1,3}$/)
        .required(),
      number: Joi.string().pattern(/^\d*$/).min(9).max(11).empty('').required(),
    }).required(),
    address: Joi.object({
      street: Joi.string().empty('').required(),
      plz: Joi.string()
        .pattern(/^\d{5}$/)
        .empty('')
        .required(),
      city: Joi.string().empty('').required(),
    }).required(),
  }).required(),
});

export default userDataSchema;
