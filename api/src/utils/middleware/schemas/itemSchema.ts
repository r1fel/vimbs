// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const itemSchema = Joi.object({
  item: Joi.object({
    picture: Joi.string().allow(null, '').optional(),
    name: Joi.string().required(),
    description: Joi.string().allow(null, '').optional(),
  }).required(),
});

export default itemSchema;
