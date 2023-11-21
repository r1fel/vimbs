// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';
import { categoriesArray } from '../../../enums';

const itemSchema = Joi.object({
  item: Joi.object({
    picture: Joi.string().allow(null, '').optional(),
    name: Joi.string().required(),
    description: Joi.string().allow(null, '').optional(),
    categories: Joi.array()
      .items(
        Joi.string()
          .valid(...categoriesArray)
          .required(),
      )
      .required(),
  }).required(),
});

export default itemSchema;
