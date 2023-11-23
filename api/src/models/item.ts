// Item Model for working with MongoDB

import mongoose, { Schema } from 'mongoose';
import { ItemInDB } from '../typeDefinitions';
// import {ItemInteraction} from './itemInteraction';
import {
  HouseAndGarden,
  ChildAndBaby,
  MediaAndGames,
  AdultClothing,
  SportAndCamping,
  Technology,
  NotDefined,
} from '../enums';

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
  categories: {
    HouseAndGarden: [
      {
        enum: HouseAndGarden,
        type: String,
      },
    ],
    ChildAndBaby: [
      {
        enum: ChildAndBaby,
        type: String,
      },
    ],
    MediaAndGames: [
      {
        enum: MediaAndGames,
        type: String,
      },
    ],
    AdultClothing: [
      {
        enum: AdultClothing,
        type: String,
      },
    ],
    SportAndCamping: [
      {
        enum: SportAndCamping,
        type: String,
      },
    ],
    Technology: [
      {
        enum: Technology,
        type: String,
      },
    ],
    NotDefined: [
      {
        enum: NotDefined,
        type: String,
      },
    ],
  },
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
  available: { type: Boolean, default: true },
});

const Item = mongoose.model<ItemInDB>('Item', ItemSchema);

export default Item;
