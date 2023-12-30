// Item Model for working with MongoDB

import mongoose, { Schema } from 'mongoose';
import { ItemInDB, UserInDB } from '../typeDefinitions';
import ItemInteraction from './itemInteraction';
import User from './user';
import ExpressError from '../utils/ExpressError';
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

// clean up after item was deleted
ItemSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // console.log(doc);
    const item: ItemInDB = doc;
    const itemId = doc._id;

    // make an array of all users that have been involved with the item
    const users = [item.owner];

    // Loop through interactions array on the item
    for (const interactionId of item.interactions) {
      // Retrieve the interaction from MongoDB
      const interaction = await ItemInteraction.findById(interactionId);

      if (interaction === null) return;
      new ExpressError('Bad Request: This interaction does not exist', 400);

      // Check if the interestedPartyId is not in the users array
      if (!users.includes(interaction.interestedParty)) {
        // Push the interestedPartyId to the users array
        users.push(interaction.interestedParty);
      }
    }

    // pull id from myItems, getItems, getHistory of all users, if id is in there

    // Loop through the users array
    for (const userId of users) {
      // Retrieve the user from MongoDB
      const user: UserInDB | null = await User.findById(userId);

      if (user) {
        // Check if itemId is in myItems array
        if (user.myItems.includes(itemId)) {
          // Use $pull to remove itemId from myItems array
          await User.updateOne({ _id: userId }, { $pull: { myItems: itemId } });
        }

        // Check if itemId is in getItems array
        if (user.getItems.includes(itemId)) {
          // Use $pull to remove itemId from getItems array
          await User.updateOne(
            { _id: userId },
            { $pull: { getItems: itemId } },
          );
        }

        // Check if itemId is in getHistory array
        if (user.getHistory.includes(itemId)) {
          // Use $pull to remove itemId from getHistory array
          await User.updateOne(
            { _id: userId },
            { $pull: { getHistory: itemId } },
          );
        }
      }
    }

    // delete all itemInteractions from DB that happened on the item
    await ItemInteraction.deleteMany({
      _id: {
        $in: doc.interactions,
      },
    });
  }
});

const Item = mongoose.model<ItemInDB>('Item', ItemSchema);

export default Item;
