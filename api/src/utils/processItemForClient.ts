import {
  DBItems,
  ResponseItemForClient,
  ObjectId,
} from '../controllers/itemControllers';
import {IItem} from '../models/item';

// function to process an array of items for the client
export const processItemForClient = async (
  items: DBItems,
  currentUser: ObjectId,
  response: Array<ResponseItemForClient>
) => {
  let itemArray: Array<IItem> = [];
  if (Array.isArray(items)) {
    itemArray = items;
  } else {
    itemArray = [items];
  }
  for (const item of itemArray) {
    const sendItem: ResponseItemForClient = {
      _id: item._id,
      name: item.name,
      available: item.available,
      picture: null,
      description: null,
      dueDate: null,
      owner: false,
      interactions: null,
      commonCommunity: null,
      ownerData: null,
    };
    if (item.picture) sendItem.picture = item.picture;
    if (item.description) sendItem.description = item.description;
    // TODO ER: revisit dueDate once "available" can be set to false
    if (item.available === false) sendItem.dueDate = new Date();
    // item.interactions[item.interactions.length - 1].dueDate
    //should use .equals
    if (item.owner == currentUser) {
      sendItem.owner = true;
      // sendItem.interactions = item.interactions;
    } else {
      sendItem.commonCommunity = {
        _id: '6544bbe8dk864e46068d74bb',
        picture:
          'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
        name: 'our common community',
      };
    }
    // TODO ER: revisit and uncomment once interactions are in place
    // if (
    //   item.interactions !== [] &&
    //   item.interactions[item.interactions.length - 1].interestedParty ===
    //     currentUser
    // ) {
    //   sendItem.interactions = item.interactions[item.interactions.length - 1];
    //   sendItem.ownerData = {_id: item.owner._id, firstName: item.owner.firstName};
    // }
    response.push(sendItem);
  }
};
