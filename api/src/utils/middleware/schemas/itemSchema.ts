// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const itemSchema = Joi.object({
  item: Joi.object({
    picture: Joi.string().allow(null, '').optional(),
    name: Joi.string().required(),
    description: Joi.string().allow(null, '').optional(),
    categories: Joi.object()
      .pattern(
        Joi.string().valid(
          'HouseAndGarden',
          'ChildAndBaby',
          'MediaAndGames',
          'AdultClothing',
          'SportAndCamping',
          'Technology',
          'Other',
        ),
        Joi.object({
          subcategories: Joi.array().min(1).items(Joi.string()).required(),
        }),
      )
      .required(),
  }).required(),
});

export default itemSchema;
