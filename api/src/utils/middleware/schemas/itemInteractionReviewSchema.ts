// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import Joi from 'joi';

const itemInteractionReviewSchema = Joi.object({
  itemInteractionReview: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    body: Joi.string().allow('').optional(),
  }).required(),
});

export default itemInteractionReviewSchema;
