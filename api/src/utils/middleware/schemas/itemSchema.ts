// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

// const itemSchema = Joi.object({
//   item: Joi.object({
//     picture: Joi.string().allow(null, '').optional(),
//     name: Joi.string().required(),
//     description: Joi.string().allow(null, '').optional(),
//     categories: Joi.object()
//       .pattern(
//         Joi.string().valid(
//           'HouseAndGarden',
//           'ChildAndBaby',
//           'MediaAndGames',
//           'AdultClothing',
//           'SportAndCamping',
//           'Technology',
//           'Other',
//         ),
//         Joi.object({
//           subcategories: Joi.array().min(1).items(Joi.string()).required(),
//         }),
//       )
//       .required(),
//   }).required(),
// });

// export default itemSchema;

import {
  HouseAndGarden,
  ChildAndBaby,
  MediaAndGames,
  AdultClothing,
  SportAndCamping,
  Technology,
  Other,
} from '../../categoryStringDefinitions';

const validCategories = [
  'HouseAndGarden',
  'ChildAndBaby',
  'MediaAndGames',
  'AdultClothing',
  'SportAndCamping',
  'Technology',
  'Other',
];

const validSubcategories: { [key: string]: string[] } = {
  HouseAndGarden,
  ChildAndBaby,
  MediaAndGames,
  AdultClothing,
  SportAndCamping,
  Technology,
  Other,
};

const itemSchema = Joi.object({
  item: Joi.object({
    picture: Joi.string().allow(null, '').optional(),
    name: Joi.string().required(),
    description: Joi.string().allow(null, '').optional(),
    categories: Joi.object()
      .pattern(
        Joi.string().valid(...validCategories),
        Joi.object({
          subcategories: Joi.array()
            .min(1)
            // not there yet. we could get Damenkleidung in Technology, but still better, than allowing any
            .items(
              Joi.string().valid(
                ...validSubcategories[validCategories[0]],
                ...validSubcategories[validCategories[1]],
                ...validSubcategories[validCategories[2]],
                ...validSubcategories[validCategories[3]],
                ...validSubcategories[validCategories[4]],
                ...validSubcategories[validCategories[5]],
                ...validSubcategories[validCategories[6]],
              ),
            )
            .required(),
        }),
      )
      .required(),
  }).required(),
});

export default itemSchema;
