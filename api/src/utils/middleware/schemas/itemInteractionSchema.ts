// Request Validation Schema, needed for Middleware: defines the accepted req.body data

import coreJoi from 'joi';
import joiDate from '@joi/date';
const Joi = coreJoi.extend(joiDate) as typeof coreJoi;

import { itemInteractionStatuses } from '../../itemInteractionStringDefinitons';

const itemInteractionSchema = Joi.object({
  itemInteraction: Joi.object({
    status: Joi.string()
      .valid(...itemInteractionStatuses)
      .required(),
    message: Joi.string().allow('').optional(),
    dueDate: Joi.date().format('YYYY-MM-DD').allow('').optional(),
  }).required(),
});

export default itemInteractionSchema;
