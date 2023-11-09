import {
  PopulatedItemsFromDB,
  ResponseItemForClient,
  ItemInteractionInDB,
  ItemInDBPopulated,
} from '../typeDefinitions';
import mongoose from 'mongoose';

// function to process an array of items for the client
export const processItemForClient = async (
  items: PopulatedItemsFromDB,
  currentUser: mongoose.Types.ObjectId,
  response: Array<ResponseItemForClient>
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
      dueDate: null,
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
      ownerData: null,
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
        lastInteraction.revealOwnerIdentity === true
          ? {_id: item.owner._id, firstName: 'Hans'}
          : null;
      }
    }
    response.push(sendItem);
  }
  return response;
};
