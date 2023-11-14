// ItemInteraction Model for working with MongoDB

import mongoose, {Schema} from 'mongoose';
import {ItemInteractionInDB} from '../typeDefinitions';

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
    enum: ['opened', 'declined', 'accepted', 'closed'],
    required: true,
  },
  statusChangesLog: [
    {
      newStatus: {
        type: String,
        enum: ['opened', 'declined', 'accepted', 'closed'],
      },
      changeInitiator: {type: String, enum: ['getter', 'giver']},
      entryTimestamp: Date,
    },
  ],
  dueDate: Date,
  messagelog: [
    {
      messageText: String,
      messageWriter: {type: String, enum: ['getter', 'giver']},
      messageTimestamp: Date,
    },
  ],
});

export const ItemInteraction = mongoose.model<ItemInteractionInDB>(
  'ItemInteraction',
  itemInteractionSchema
);

// export default ItemInteraction;
