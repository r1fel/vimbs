// Item Model for working with MongoDB

import mongoose, { Schema } from 'mongoose';
import { ItemInDB } from '../typeDefinitions';
// import {ItemInteraction} from './itemInteraction';
import { categoriesArray } from '../enums';

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
  categories: [
    {
      type: String,
      enum: categoriesArray,
      required: true,
    },
  ],
  // TODO ER: some code how the category enums might be used here
  // [{
  //   EnumCategoryHouseAndGarden: Object.values(
  //     EnumCategoryHouseAndGarden,
  //   ) as string[],
  // },
  // {
  //   EnumCategoryChildAndBaby: Object.values(
  //     EnumCategoryChildAndBaby,
  //   ) as string[],
  // },
  // {
  //   EnumCategoryMediaAndGames: Object.values(
  //     EnumCategoryMediaAndGames,
  //   ) as string[],
  // },
  // {
  //   EnumCategoryAdultClothing: Object.values(
  //     EnumCategoryAdultClothing,
  //   ) as string[],
  // },
  // {
  //   EnumCategorySportAndCamping: Object.values(
  //     EnumCategorySportAndCamping,
  //   ) as string[],
  // },
  // {
  //   EnumCategoryTechnology: Object.values(EnumCategoryTechnology) as string[],
  // },
  // {
  //   EnumCategoryUndefined: Object.values(EnumCategoryUndefined) as string[],
  // },
  // ],
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
