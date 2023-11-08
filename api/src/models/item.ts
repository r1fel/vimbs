import mongoose, {Schema} from 'mongoose';
import {ItemInDB} from '../typeDefinitions';
// import {ItemInteraction} from './itemInteraction';

const ItemSchema: Schema = new Schema({
  creationDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  picture: String,
  name: {
    type: String,
    required: true,
  },
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  interactions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'ItemInteraction',
    },
  ],
  available: {type: Boolean, default: true},
});

export const Item = mongoose.model<ItemInDB>('Item', ItemSchema);
