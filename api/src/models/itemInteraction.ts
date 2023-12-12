// ItemInteraction Model for working with MongoDB

import mongoose, { Schema } from 'mongoose';
import { ItemInteractionInDB } from '../typeDefinitions';
import {
  itemInteractionStatuses,
  itemInteractionPartakers,
} from '../utils/itemInteractionStringDefinitons';

const itemInteractionSchema: Schema = new Schema({
  creationDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  interestedParty: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  revealOwnerIdentity: {
    type: Boolean,
    default: false,
    required: true,
  },
  interactionStatus: {
    type: String,
    enum: itemInteractionStatuses,
    required: true,
  },
  statusChangesLog: [
    {
      newStatus: {
        type: String,
        enum: itemInteractionStatuses,
      },
      changeInitiator: { type: String, enum: itemInteractionPartakers },
      entryTimestamp: Date,
    },
  ],
  dueDate: Date,
  messagelog: [
    {
      messageText: String,
      messageWriter: { type: String, enum: itemInteractionPartakers },
      messageTimestamp: Date,
    },
  ],
});

const ItemInteraction = mongoose.model<ItemInteractionInDB>(
  'ItemInteraction',
  itemInteractionSchema,
);

export default ItemInteraction;
