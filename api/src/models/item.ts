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
  Other,
  HouseAndGardenName,
  ChildAndBabyName,
  MediaAndGamesName,
  AdultClothingName,
  SportAndCampingName,
  TechnologyName,
  OtherName,
} from '../utils/categoryStringDefinitions';

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
    HouseAndGarden: {
      name: {
        type: String,
        default: HouseAndGardenName,
      },
      subcategories: [
        {
          enum: HouseAndGarden,
          type: String,
        },
      ],
    },
    ChildAndBaby: {
      name: {
        type: String,
        default: ChildAndBabyName,
      },
      subcategories: [
        {
          enum: ChildAndBaby,
          type: String,
        },
      ],
    },
    MediaAndGames: {
      name: {
        type: String,
        default: MediaAndGamesName,
      },
      subcategories: [
        {
          enum: MediaAndGames,
          type: String,
        },
      ],
    },
    AdultClothing: {
      name: {
        type: String,
        default: AdultClothingName,
      },
      subcategories: [
        {
          enum: AdultClothing,
          type: String,
        },
      ],
    },
    SportAndCamping: {
      name: {
        type: String,
        default: SportAndCampingName,
      },
      subcategories: [
        {
          enum: SportAndCamping,
          type: String,
        },
      ],
    },
    Technology: {
      name: {
        type: String,
        default: TechnologyName,
      },
      subcategories: [
        {
          enum: Technology,
          type: String,
        },
      ],
    },
    Other: {
      name: {
        type: String,
        default: OtherName,
      },
      subcategories: [
        {
          enum: Other,
          type: String,
        },
      ],
    },
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
