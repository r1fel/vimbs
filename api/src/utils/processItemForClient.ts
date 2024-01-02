// Function that takes the items from the DB and processes them to be sent to the client

import User from '../models/user';
import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  ItemInDBPopulated,
  UserInDB,
} from '../typeDefinitions';
import mongoose from 'mongoose';

import {
  noFirstName,
  noPhoneNumber,
  noProfilePicture,
} from './processItemForClientStringDefinitions';

// function to process an array of items for the client
const processItemForClient = async (
  items: PopulatedItemsFromDB,
  currentUser: mongoose.Types.ObjectId,
  response: Array<ResponseItemForClient>,
) => {
  if (items === null) return (response = []);

  let itemArray: Array<ItemInDBPopulated> = [];
  if (Array.isArray(items)) {
    itemArray = items;
  } else {
    itemArray = [items];
  }

  for (const item of itemArray) {
    if (item.owner === null || item.interactions === null) continue;

    const ownerBool: boolean = item.owner._id.equals(currentUser)
      ? true
      : false;

    const sendItem: ResponseItemForClient = {
      _id: item._id,
      name: item.name,
      available: item.available,
      picture: !item.picture ? null : item.picture,
      description: !item.description ? null : item.description,
      categories: item.categories,
      dueDate: null, //changed by condition below
      owner: ownerBool,
      interactions: ownerBool ? item.interactions : null,
      commonCommunity: ownerBool
        ? null
        : {
            _id: new mongoose.Types.ObjectId('6544be0f04b3ecd121538985'),
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          },
      ownerData: null, //changed by condition below
    };

    if (item.interactions.length !== 0) {
      const lastInteraction: mongoose.Types.ObjectId | ItemInteractionInDB =
        item.interactions[item.interactions.length - 1];
      if (lastInteraction instanceof mongoose.Types.ObjectId) {
        response.push(sendItem);
        continue;
      }

      if (sendItem.available === false)
        sendItem.dueDate = lastInteraction.dueDate;

      if (lastInteraction.interestedParty.equals(currentUser)) {
        sendItem.interactions = [lastInteraction];
        if (lastInteraction.revealOwnerIdentity === true) {
          let owner: UserInDB | null;
          if (item.owner instanceof mongoose.Types.ObjectId) {
            owner = await User.findById(item.owner._id);
          } else {
            owner = item.owner;
          }
          if (owner === null) continue;
          sendItem.ownerData = {
            _id: owner._id,
            name: `${owner.firstName ? owner.firstName : noFirstName} ${
              owner.lastName ? owner.lastName : ''
            }`,
            picture: owner.profilePicture
              ? owner.profilePicture
              : noProfilePicture,
            email: owner.email, // adjust by user settings - showEmail bool false -> don't show email
            phone: owner.phone?.number // adjust by user settings - showPhone bool false -> don't show phone
              ? `${owner.phone?.countryCode}${owner.phone?.number}`
              : noPhoneNumber,
          };
        }
      }
    }
    response.push(sendItem);
  }
  return response;
};

export default processItemForClient;
