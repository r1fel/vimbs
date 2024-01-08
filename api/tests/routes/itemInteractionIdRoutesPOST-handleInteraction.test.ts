import request from 'supertest';
import makeApp from '../../src/app';
import * as database from '../../src/database';
import { ItemInteractionRequest } from '../../src/typeDefinitions';

import getFutureDate from '../../src/utils/getFutureDate';

// predefined Strings
import { noProfilePicture } from '../../src/utils/processItemForClientStringDefinitions';

const app = makeApp(database);

// routedefinitions
import {
  loginRoute,
  logoutRoute,
  authRoute,
  itemRoute,
  itemIdInteractionRoute,
  itemIdInteractionIdRoute,
  itemIdToggleAvailabilityRoute,
  bibisUserId,
  bobsUserId,
} from './utilsForRoutes';

// frequently used functions
const loginBodo4 = async () => {
  const loginBodo4Response = await request(app).post(loginRoute).send({
    email: 'bodo4@gmail.com',
    password: 'bodo4',
  });
  // Access the headers and get the 'set-cookie' header
  const setCookieHeader = loginBodo4Response.headers['set-cookie'];
  // Extract the connect.sid value from the 'set-cookie' header
  const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];
  // console.log('connect.sid value:', connectSidValue);

  return connectSidValue;
};

const loginUser = async (email: string, password: string) => {
  const loginUserResponse = await request(app).post(loginRoute).send({
    email: email,
    password: password,
  });
  // Access the headers and get the 'set-cookie' header
  const setCookieHeader = loginUserResponse.headers['set-cookie'];
  // Extract the connect.sid value from the 'set-cookie' header
  const connectSidValue = setCookieHeader[0].split(';')[0].split('=')[1];
  // console.log('connect.sid value:', connectSidValue);

  return connectSidValue;
};

const logout = async (connectSidValue: string) => {
  await request(app)
    .post(logoutRoute)
    .set('Cookie', [`connect.sid=${connectSidValue}`]);
};

// pass in the route which is protected by the isLoggedIn middleware
// test, that middleware is doing it's route protecting properly
const notPassedIsLoggedIn = (httpVerb: string, route: string) => {
  const invalidConnectSidValue =
    's%3AnFsjM4XUm0O8fA0JrqIKBQFDjTOp538v.uJgEmwcCkUfu1fIRpleL0DTM58naHwgEzD5gDw%2B82tY';

  describe('when isLoggedIn was not passed', () => {
    it('should respond error with a statusCode401 if req.user undefined', async () => {
      const response = await (request(app) as any)[httpVerb](route);

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    }, 10000);
    it('should respond error with a statusCode401 if invalid session cookie is sent', async () => {
      const response = await (request(app) as any)
        [httpVerb](route)
        .set('Cookie', [`connect.sid=${invalidConnectSidValue}`]);

      // console.log('Test IsLoggedIn: expect 401:', response.statusCode);

      expect(response.statusCode).toBe(401);
      expect(response.text).toContain('Error: Unauthorized');
    }),
      10000;
  });
};

// for DeclinedOnOpened
const checkResponseToBeCorrectlyProcessedItemForClient = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingDeclinedOnOpenedStatus',
    available: true,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: null,
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: false,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: validBody.itemInteraction.status,
            changeInitiator: interactingParty,
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingDeclinedOnOpenedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: interactingParty,
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: validBody.itemInteraction.status,
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData: null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for OpenedOnOpened
const checkResponseToBeCorrectlyProcessedItemForClientOpenedOnOpened = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingOpenedOnOpenedStatus',
    available: false,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: expect.any(String),
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: false,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingOpenedOnOpenedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: interactingParty,
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'opened',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData: null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for AcceptedOnOpened
const checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnOpened = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingAcceptedOnOpenedStatus',
    available: false,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: expect.any(String),
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: true,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'accepted',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingAcceptedOnOpenedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: 'giver',
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'accepted',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData:
      interactingParty === 'getter'
        ? {
            _id: expect.any(String),
            name: 'bodo4 The Big',
            email: 'bodo4@gmail.com',
            picture: noProfilePicture,
            phone: '+4917298086213',
          }
        : null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for AcceptedOnAccepted
const checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnAccepted = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingAcceptedOnAcceptedStatus',
    available: false,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: expect.any(String),
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: true,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'accepted',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingAcceptedOnAcceptedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'accepting interaction for testForRequestingAcceptedOnAcceptedStatus',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: interactingParty,
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'accepted',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData:
      interactingParty === 'getter'
        ? {
            _id: expect.any(String),
            name: 'bodo4 The Big',
            email: 'bodo4@gmail.com',
            picture: noProfilePicture,
            phone: '+4917298086213',
          }
        : null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for ClosedOnAccepted
const checkResponseToBeCorrectlyProcessedItemForClientClosedOnAccepted = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingClosedOnAcceptedStatus',
    available: true,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: null,
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: true,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'accepted',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'closed',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingClosedOnAcceptedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'accepting interaction for testForRequestingClosedOnAcceptedStatus',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: 'giver',
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'closed',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData:
      interactingParty === 'getter'
        ? {
            _id: expect.any(String),
            name: 'bodo4 The Big',
            email: 'bodo4@gmail.com',
            picture: noProfilePicture,
            phone: '+4917298086213',
          }
        : null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for DeclinedOnDeclined
const checkResponseToBeCorrectlyProcessedItemForClientDeclinedOnDeclined = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingDeclinedOnDeclinedStatus',
    available: true,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: null,
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: false,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'declined',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingDeclinedOnDeclinedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'declining interaction for testForRequestingDeclinedOnDeclinedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: interactingParty,
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'declined',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData: null,
  };

  return correctlyProcessedItemInteractionForClient;
};

// for ClosedOnClosed
const checkResponseToBeCorrectlyProcessedItemForClientClosedOnClosed = (
  interactingParty: 'giver' | 'getter',
  validBody: {
    itemInteraction: ItemInteractionRequest;
  },
) => {
  const correctlyProcessedItemInteractionForClient = {
    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
    name: 'Item for testForRequestingClosedOnClosedStatus',
    available: true,
    picture: null,
    description: null,
    categories: {
      AdultClothing: {
        name: 'Mode',
        subcategories: [],
      },
      ChildAndBaby: {
        name: 'Kind und Baby',
        subcategories: [],
      },
      HouseAndGarden: {
        name: 'Haus und Garten',
        subcategories: [],
      },
      MediaAndGames: {
        name: 'Medien und Spiele',
        subcategories: [],
      },
      Other: {
        name: 'Sonstiges',
        subcategories: ['Sonstiges'],
      },
      SportAndCamping: {
        name: 'Sport und Camping',
        subcategories: [],
      },
      Technology: {
        name: 'Technik und Zubehör',
        subcategories: [],
      },
    },
    dueDate: null,
    owner: interactingParty === 'getter' ? false : true,
    interactions: [
      {
        revealOwnerIdentity: true,
        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
        creationDate: expect.any(String),
        statusChangesLog: [
          {
            newStatus: 'opened',
            changeInitiator: 'getter',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'accepted',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            newStatus: 'closed',
            changeInitiator: 'giver',
            entryTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
        ],
        messagelog: [
          {
            messageText:
              'opening interaction for testForRequestingClosedOnClosedStatus',
            messageWriter: 'getter',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'accepting interaction for testForRequestingClosedOnClosedStatus',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          {
            messageText:
              'closing interaction for testForRequestingClosedOnClosedStatus',
            messageWriter: 'giver',
            messageTimestamp: expect.any(String),
            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
          },
          validBody.itemInteraction.message
            ? {
                messageText: validBody.itemInteraction.message,
                messageWriter: interactingParty,
                messageTimestamp: expect.any(String),
                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
              }
            : undefined,
        ],
        interestedParty: bibisUserId,
        interactionStatus: 'closed',
        dueDate: expect.any(String),
        __v: expect.any(Number),
      },
    ],
    commonCommunity:
      interactingParty === 'getter'
        ? {
            _id: '6544be0f04b3ecd121538985',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          }
        : null,
    ownerData:
      interactingParty === 'getter'
        ? {
            _id: expect.any(String),
            name: 'bodo4 The Big',
            email: 'bodo4@gmail.com',
            picture: noProfilePicture,
            phone: '+4917298086213',
          }
        : null,
  };

  return correctlyProcessedItemInteractionForClient;
};

const notPassedItemInteractionBelongsToItem = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when itemInteractionBelongsToItem was not passed', () => {
    describe('when invalid itemId is given', () => {
      const invalidInteractionIdOfCorrectPattern = '65673cc5811318fde3968158';
      it('should respond error with a statusCode400 for not existing itemId', async () => {
        // id has correct pattern, but item doesnt exist
        const invalidItemIdOfCorrectPattern = '65673cc5811318fde3968147';

        // login bodo4
        const connectSidValue = await loginBodo4();

        // try route in question with wrong id
        const response = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${invalidItemIdOfCorrectPattern}/${routeEnd}/${invalidInteractionIdOfCorrectPattern}`,
          )
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('expect 400:', response.statusCode, response.text);
        // expect route in question to throw 400
        expect(response.statusCode).toBe(400);
        expect(response.text).toContain(
          'Error: Bad Request: This item does not exist',
        );

        // logout bodo4
        await logout(connectSidValue);
      }, 10000);
      it('should respond error with a statusCode500 for itemId value that could not be cast to ObjectId', async () => {
        // login bodo4
        const connectSidValue = await loginBodo4();

        const invalidItemIdOfWrongPattern = '65673cc58318fde3968147';
        const invalidItemIdOfWrongPattern2 = 'hi';
        // TODO ER: I get a 500 for this one - what is happening here?
        // const invalidItemIdOfWrongPattern3 = '(ksd%=ks-.."9'; // URIError: Failed to decode param &#39;(ksd%=ks-..%229&#39;

        const invalidIDs = [
          invalidItemIdOfWrongPattern,
          invalidItemIdOfWrongPattern2,
          // invalidItemIdOfWrongPattern3,
        ];
        for (const invalidId of invalidIDs) {
          // try route in question with wrong id
          const response = await (request(app) as any)
            [httpVerb](
              `${routeBase}/${invalidId}/${routeEnd}/${invalidInteractionIdOfCorrectPattern}`,
            )
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // console.log('expect 500:', response.statusCode, response.text);
          // expect route in question to throw 500
          expect(response.statusCode).toBe(500);
          expect(response.text).toContain(
            'CastError: Cast to ObjectId failed for value',
          );
        }

        // logout bodo4
        await logout(connectSidValue);
      }, 10000);
    });

    describe('when invalid interactionId is given', () => {
      it('should respond error with a statusCode400 for not existing interactionId', async () => {
        // id has correct pattern, but item doesnt exist
        const invalidInteractionIdOfCorrectPattern = '65673cc5811318fde3968158';

        // login bodo4
        const connectSidValue = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // try route in question with wrong id
        const response = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeEnd}/${invalidInteractionIdOfCorrectPattern}`,
          )
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // console.log('expect 400:', response.statusCode, response.text);
        // expect route in question to throw 400
        expect(response.statusCode).toBe(400);
        expect(response.text).toContain(
          'Error: Bad Request: This interaction does not exist',
        );

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout bodo4
        await logout(connectSidValue);
      }, 10000);

      it('should respond error with a statusCode500 for interactionId value that could not be cast to ObjectId', async () => {
        // login bodo4
        const connectSidValue = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValue}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        const invalidInteractionIdOfWrongPattern = '65673cc58318fde3968147';
        const invalidInteractionIdOfWrongPattern2 = 'hi';
        // TODO ER: I get a 500 for this one - what is happening here?
        // const invalidInteractionIdOfWrongPattern3 = '(ksd%=ks-.."9'; // URIError: Failed to decode param &#39;(ksd%=ks-..%229&#39;

        const invalidIDs = [
          invalidInteractionIdOfWrongPattern,
          invalidInteractionIdOfWrongPattern2,
          // invalidInteractionIdOfWrongPattern3,
        ];
        for (const invalidId of invalidIDs) {
          // try route in question with wrong id
          const response = await (request(app) as any)
            [httpVerb](`${routeBase}/${itemId}/${routeEnd}/${invalidId}`)
            .set('Cookie', [`connect.sid=${connectSidValue}`]);

          // console.log('expect 500:', response.statusCode, response.text);
          // expect route in question to throw 500
          expect(response.statusCode).toBe(500);
          expect(response.text).toContain(
            'CastError: Cast to ObjectId failed for value',
          );
        }

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValue}`]);

        // logout bodo4
        await logout(connectSidValue);
      }, 10000);
    });

    describe('when the interaction does not exist on the item', () => {
      it('should respond error with a statusCode400', async () => {
        // bodo4 creates 2 items, on item 2 bibi opens a request
        // check if middleware throws an error, when itemId1 and interactionId on item2 are used in one request

        // login Bodo4, let him create 2 Items
        const connectSidValueBodo4First = await loginBodo4();

        // create item 1
        const createItemResponse1 = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId1 = createItemResponse1.body[0]._id;

        // create item 2
        const createItemResponse2 = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing itemInteractionBelongsToItem middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId2 = createItemResponse2.body[0]._id;

        // logout
        await logout(connectSidValueBodo4First);

        // login bibi
        const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

        // bibi opens a interaction
        const itemInteractionResponse = await request(app)
          .post(
            `${itemRoute}/${itemId2}/${
              itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
            }`,
          )
          .send({
            itemInteraction: {
              status: 'opened',
              message:
                'Interaction on Item 2 of testing itemInteractionBelongsToItem middleware',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
        // extract interactionId
        const interactionIdOnItem2 =
          itemInteractionResponse.body[0].interactions[0]._id;

        // try route in question with wrong pairing of Id's
        const itemInteractionIdResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId1}/${routeEnd}/${interactionIdOnItem2}`,
          )
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

        // logout bibi
        await logout(connectSidValueBibi);

        // login Bodo4, let him create Item with passed in Body
        const connectSidValueBodo4Second = await loginBodo4();

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

        // logout
        await logout(connectSidValueBodo4Second);

        // console.log('expect 400:', response.statusCode, response.text);
        // expect route in question to throw 400
        expect(itemInteractionIdResponse.statusCode).toBe(400);
        expect(itemInteractionIdResponse.text).toContain(
          'Error: Bad Request: The requested item and interaction do not match!',
        );
      }, 10000);
    });
  });
};

const notPassedIsInteractionPartaker = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when isInteractionPartaker was not passed', () => {
    describe('when the user is neither item.owner nor interaction.interestedParty', () => {
      it('should respond error with a statusCode403', async () => {
        // bodo4 creates an item on which bibi opens a request
        // check if middleware throws an error when bob tries to access /item/bobsItem/itemInteraction/bibisInteraction

        // login Bodo4, let him create an item
        const connectSidValueBodo4First = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing isInteractionPartaker middleware',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // logout
        await logout(connectSidValueBodo4First);

        // login bibi
        const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

        // bibi opens a interaction
        const itemInteractionResponse = await request(app)
          .post(
            `${itemRoute}/${itemId}/${
              itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
            }`,
          )
          .send({
            itemInteraction: {
              status: 'opened',
              message:
                'Interaction on Item 2 of testing isInteractionPartaker middleware',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
        // extract interactionId
        const interactionIdOnItem =
          itemInteractionResponse.body[0].interactions[0]._id;

        // logout bibi
        await logout(connectSidValueBibi);

        // login bob
        const connectSidValueBob = await loginUser('bob@gmail.com', 'bob');

        // try route in question using the correct pairing of Ids, but beeing neither item.owner nor interaction.interestedParty
        const itemInteractionIdResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeEnd}/${interactionIdOnItem}`,
          )
          .set('Cookie', [`connect.sid=${connectSidValueBob}`]);

        // logout bob
        await logout(connectSidValueBob);

        // login Bodo4
        const connectSidValueBodo4Second = await loginBodo4();

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

        // logout
        await logout(connectSidValueBodo4Second);

        // console.log('expect 403:', response.statusCode, response.text);
        // expect route in question to throw 403
        expect(itemInteractionIdResponse.statusCode).toBe(403);
        expect(itemInteractionIdResponse.text).toContain(
          'Error: Forbidden: You do not have permission to do that!',
        );
      }, 10000);
    });
  });
};

const expectsForError = (
  statusCode: number,
  invalidity: string,
  response: request.Response,
) => {
  // console.log(response.statusCode, response.error);

  // expects
  expect(response.statusCode).toBe(statusCode);
  expect(response.text).toContain(invalidity);

  // log for checking that all validation test ran completely
  // console.log('expectsForError ran for invalidity', invalidity);
};

const notPassedValidateItemInteraction = (
  httpVerb: string,
  routeBase: string,
  routeEnd: string,
) => {
  describe('when validateItemInteraction was not passed', () => {
    describe('when invalid itemInteraction Body is given', () => {
      // test function for all bodys in this block
      const testForInvalidItemInteractionBody = async (
        statusCode: number,
        invalidity: string,
        invalidItemInteractionBody: any,
      ) => {
        // define Body to be used in this test
        const itemInteractionBody = invalidItemInteractionBody;

        // login Bodo4, let him create Item with passed in Body
        const connectSidValueBodo4First = await loginBodo4();

        // create item
        const createItemResponse = await request(app)
          .post(itemRoute)
          .send({
            item: {
              name: 'Item for testing validateItemInteraction',
              categories: { Other: { subcategories: ['Sonstiges'] } },
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
        // extract itemId
        const itemId = createItemResponse.body[0]._id;

        // logout
        await logout(connectSidValueBodo4First);

        // login bibi
        const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

        // bibi opens a interaction
        const openItemInteractionResponse = await request(app)
          .post(
            `${itemRoute}/${itemId}/${
              itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
            }`,
          )
          .send({
            itemInteraction: {
              status: 'opened',
              message: 'opening interaction for validateItem',
            },
          })
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
        // extract interactionId
        const interactionIdOnItem =
          openItemInteractionResponse.body[0].interactions[0]._id;

        // test route of interest on just created item + interaction pairing
        const handleItemInteractionResponse = await (request(app) as any)
          [httpVerb](
            `${routeBase}/${itemId}/${routeEnd}/${interactionIdOnItem}`,
          )
          .send(itemInteractionBody)
          .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

        // logout bibi
        await logout(connectSidValueBibi);

        // login Bodo4, let him create Item with passed in Body
        const connectSidValueBodo4Second = await loginBodo4();

        // delete all items
        const deleteAllOfUsersItemsResponse = await request(app)
          .delete(itemRoute)
          .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

        // logout
        await logout(connectSidValueBodo4Second);

        expectsForError(statusCode, invalidity, handleItemInteractionResponse);
      };

      describe('should respond error with a statusCode400', () => {
        // for missing status
        const invalidItemInteractionBody1 = {
          itemInteraction: {
            // status : 'opened',
            message: 'some string',
            dueDate: '2024-02-11',
          },
        };

        it('for missing status', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.status&quot; is required<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody1,
          );
        }, 10000);

        // for invalid status
        const invalidItemInteractionBody2 = {
          itemInteraction: {
            status: 'invalidStatus',
            message: 'some string',
            dueDate: '2024-02-11',
          },
        };

        it('for invalid status', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.status&quot; must be one of [opened, declined, accepted, closed]<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody2,
          );
        }, 10000);

        // for empty body
        const invalidItemInteractionBody3 = {};

        it('for empty body', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction&quot; is required<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody3,
          );
        }, 10000);

        // for empty itemInteraction
        const invalidItemInteractionBody4 = {
          itemInteraction: {},
        };

        it('for empty itemInteraction', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.status&quot; is required<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody4,
          );
        }, 10000);

        // for due Date in wrong date format
        const invalidItemInteractionBody5 = {
          itemInteraction: {
            status: 'opened',
            message: 'some string',
            dueDate: '2024/02/11',
          },
        };

        it('for due Date in wrong date format', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.dueDate&quot; must be in YYYY-MM-DD format<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody5,
          );
        }, 10000);

        // for message is not a string
        const invalidItemInteractionBody6 = {
          itemInteraction: {
            status: 'opened',
            message: 123,
            dueDate: '2024-02-11',
          },
        };

        it('for message is not a string', async () => {
          await testForInvalidItemInteractionBody(
            400,
            'Error: &quot;itemInteraction.message&quot; must be a string<br> &nbsp; &nbsp;at validateItemInteraction',
            invalidItemInteractionBody6,
          );
        }, 10000);
      });
    });
  });
};

const getFutureDateForBody = (weeks = 2): string => {
  const futureDate = getFutureDate(weeks);

  // Formatting the date to 'YYYY-MM-DD'
  const year = futureDate.getFullYear();
  const month = String(futureDate.getMonth() + 1).padStart(2, '0');
  const day = String(futureDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const bodo4CreatesItem = async (testName: string) => {
  // login Bodo4, let him create Item with passed in Body
  const connectSidValueBodo4First = await loginBodo4();

  // create item
  const createItemResponse = await request(app)
    .post(itemRoute)
    .send({
      item: {
        name: `Item for ${testName}`,
        categories: { Other: { subcategories: ['Sonstiges'] } },
      },
    })
    .set('Cookie', [`connect.sid=${connectSidValueBodo4First}`]);
  // extract itemId
  const itemId = createItemResponse.body[0]._id;

  // logout
  await logout(connectSidValueBodo4First);

  return itemId;
};

const bibiOpensInteraction = async (itemId: string, testName: string) => {
  // login bibi
  const connectSidValueBibi = await loginUser('bibi@gmail.com', 'bibi');

  // bibi opens an interaction
  const openItemInteractionResponse = await request(app)
    .post(
      `${itemRoute}/${itemId}/${
        itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
      }`,
    )
    .send({
      itemInteraction: {
        status: 'opened',
        message: `opening interaction for ${testName}`,
      },
    })
    .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
  // extract interactionId
  const interactionIdOnItem =
    openItemInteractionResponse.body[0].interactions[0]._id;

  // logout bibi
  await logout(connectSidValueBibi);

  return interactionIdOnItem;
};

// TESTS
describe('itemInteraction Routes', () => {
  // close DB after tests ran - to get rid of db related error
  afterAll(async () => {
    await database.closeDatabaseConnection();
  });

  describe(`POST ${itemIdInteractionIdRoute} (handle interaction)`, () => {
    //! uncomment for final testround
    // // check if isLoggedIn throws appropriate errors
    // notPassedIsLoggedIn(
    //   'post',
    //   `${itemRoute}/65673cc5811318fde3968147/${
    //     itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
    //   }/65673cc5811318fde3968158`,
    // );
    // // check if itemInteractionBelongsToItem throws appropriate errors
    // notPassedItemInteractionBelongsToItem(
    //   'post',
    //   itemRoute,
    //   itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    // );
    // // check if isInteractionPartaker throws appropriate errors
    // notPassedIsInteractionPartaker(
    //   'post',
    //   itemRoute,
    //   itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    // );
    // // check if validateItemInteraction throws appropriate errors
    // notPassedValidateItemInteraction(
    //   'post',
    //   itemRoute,
    //   itemIdInteractionRoute.split(':itemId/').slice(-1)[0],
    // );

    describe('when itemInteraction body is dealt with at controller', () => {
      describe('for current interactionStatus is opened', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request

          // test: bodo4 creates an item,
          // login bibi, have bibi open an interaction, [if getter: get showItem, have bibi do the request of interest, get showItem,] logout bibi,
          // login bodo4, [if giver: get showItem, have bodo4 do the request of interest, get showItem,] delete all of bodo4's items, logout bodo4
          const testForRequestingWrongStatus = async (
            interactingParty: 'giver' | 'getter',
            statusCode: number,
            invalidity: string,
            validItemInteractionBody: {
              itemInteraction: ItemInteractionRequest;
            },
          ) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(
              'testForRequestingWrongStatus',
            );

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // bibi opens an interaction
            const openItemInteractionResponse = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }`,
              )
              .send({
                itemInteraction: {
                  status: 'opened',
                  message:
                    'opening interaction for testForRequestingWrongStatus',
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            // extract interactionId
            const interactionIdOnItem =
              openItemInteractionResponse.body[0].interactions[0]._id;

            let getShowItemResponseBefore: any = undefined;
            let handleItemInteractionResponse: any = undefined;
            let getShowItemResponseAfter: any = undefined;
            if (interactingParty === 'getter') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            }

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            if (interactingParty === 'giver') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
            }
            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // logout
            await logout(connectSidValueBodo4Second);

            expect(getShowItemResponseBefore.body[0]).not.toBe(undefined);
            expect(getShowItemResponseBefore.body[0]).toEqual(
              getShowItemResponseAfter.body[0],
            );

            expectsForError(
              statusCode,
              invalidity,
              handleItemInteractionResponse,
            );
          };

          describe('when owner', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test
            const validItemInteractionBody = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatus(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBody,
              );
            }, 20000);
          });
          describe('when interestedParty', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test
            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatus(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
              );
            }, 10000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForRequestingWrongStatus(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 10000);
          });
        });
        describe('should respond successful with a statusCode200 and item data', () => {
          describe('for status opened', () => {
            // expect statements for all tests in this block
            const expectsForOpenedOnOpened = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientOpenedOnOpened(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: false, ownerData: null,
              //  statusChangeLog no new entry, interactionStatus: 'opened',
              //  messagelog includes new message, item.dueDate: same as before

              // this does not yet check the dates sufficiently, thus
              // the interactionDueDate is checked to be the date set by bibi when opening the interaction by
              const dueDateSetByBibiUponOpeningInteraction =
                getFutureDateForBody(2);
              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(dueDateSetByBibiUponOpeningInteraction);
              expect(
                new Date(updatedItem.dueDate).toISOString().split('T')[0],
              ).toEqual(dueDateSetByBibiUponOpeningInteraction);
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'opened',
                message: '', // empty string
                dueDate: getFutureDateForBody(4),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'opened',
                // message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                // dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item, login bibi, have bibi open an interaction, if interactingParty=getter - have bibi do request of interest, logout bibi,
            // login bodo4, if interactingParty=giver - have bodo4 do request of interest, delete all of bodo4's items, logout bodo4
            const testForRequestingOpenedOnOpenedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingOpenedOnOpenedStatus',
              );

              // login bibi
              const connectSidValueBibi = await loginUser(
                'bibi@gmail.com',
                'bibi',
              );

              // bibi opens an interaction
              const openItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteraction: {
                    status: 'opened',
                    message:
                      'opening interaction for testForRequestingOpenedOnOpenedStatus',
                    dueDate: getFutureDateForBody(2),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              let handleItemInteractionResponse: any = undefined;
              if (interactingParty === 'getter') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              }

              // logout bibi
              await logout(connectSidValueBibi);

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              if (interactingParty === 'giver') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              }

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expectsForOpenedOnOpened(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);
            });

            describe('requested by interestedParty', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingOpenedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 10000);
            });
          });

          describe('for status declined', () => {
            // expect statements for all tests in this block
            const expectsForDeclinedOnOpened = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClient(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
              //  statusChangeLog with new entry, interactionStatus: 'declined',
              //  messagelog includes new message, item.dueDate: null

              // this does not yet check the dates sufficiently, thus
              // the interactionDueDate is checked to be today by
              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(new Date().toISOString().split('T')[0]);
              // further dates are set in other requests, which are tested elsewhere
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'declined',
                message: '', // empty string
                dueDate: getFutureDateForBody(4),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'declined',
                // message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                // dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item, login bibi, have bibi open an interaction, if interactingParty=getter - have bibi do request of interest, logout bibi,
            // login bodo4, if interactingParty=giver - have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4
            const testForDeclinedOnOpenedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingDeclinedOnOpenedStatus',
              );

              // login bibi
              const connectSidValueBibi = await loginUser(
                'bibi@gmail.com',
                'bibi',
              );

              // bibi opens an interaction
              const openItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteraction: {
                    status: 'opened',
                    message:
                      'opening interaction for testForRequestingDeclinedOnOpenedStatus',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              let handleItemInteractionResponse: any = undefined;
              if (interactingParty === 'getter') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              }

              // logout bibi
              await logout(connectSidValueBibi);

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              if (interactingParty === 'giver') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              }

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expectsForDeclinedOnOpened(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              // test: bodo4 creates an item, bibi opens interaction,
              // login bodo4, have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4

              it('with message text and future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);

              it('if interaction is not interactions[0]', async () => {
                // expect statements for all tests in this block
                const expectsForDeclinedOnOpenedSecondInteractionInArray = (
                  interactingParty: 'giver' | 'getter',
                  validBody: { itemInteraction: ItemInteractionRequest },
                  itemInteractionResponse: request.Response,
                ) => {
                  // expects
                  expect(itemInteractionResponse.statusCode).toBe(200);
                  // expect the body array to only have one object inside
                  expect(itemInteractionResponse.body).toHaveLength(1);

                  // expect the body[0] to resemble the data inputs from validUpdateBody
                  const updatedItem = itemInteractionResponse.body[0];
                  expect(updatedItem.interactions.length).toBe(2);
                  expect(updatedItem).toEqual({
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    name: 'Item for testForRequestingDeclinedOnOpenedStatus',
                    available: true,
                    picture: null,
                    description: null,
                    categories: {
                      AdultClothing: {
                        name: 'Mode',
                        subcategories: [],
                      },
                      ChildAndBaby: {
                        name: 'Kind und Baby',
                        subcategories: [],
                      },
                      HouseAndGarden: {
                        name: 'Haus und Garten',
                        subcategories: [],
                      },
                      MediaAndGames: {
                        name: 'Medien und Spiele',
                        subcategories: [],
                      },
                      Other: {
                        name: 'Sonstiges',
                        subcategories: ['Sonstiges'],
                      },
                      SportAndCamping: {
                        name: 'Sport und Camping',
                        subcategories: [],
                      },
                      Technology: {
                        name: 'Technik und Zubehör',
                        subcategories: [],
                      },
                    },
                    dueDate: null,
                    owner: interactingParty === 'getter' ? false : true,
                    interactions: [
                      interactingParty === 'giver'
                        ? {
                            revealOwnerIdentity: false,
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                            creationDate: expect.any(String),
                            statusChangesLog: [
                              {
                                newStatus: 'opened',
                                changeInitiator: 'getter',
                                entryTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                              {
                                newStatus: 'declined',
                                changeInitiator: 'getter',
                                entryTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                            ],
                            messagelog: [
                              {
                                messageText:
                                  'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                                messageWriter: 'getter',
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                              {
                                messageText:
                                  'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                                messageWriter: 'getter',
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              },
                            ],
                            interestedParty: bibisUserId,
                            interactionStatus: 'declined',
                            dueDate: expect.any(String),
                            __v: expect.any(Number),
                          }
                        : undefined,
                      {
                        revealOwnerIdentity: false,
                        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                        creationDate: expect.any(String),
                        statusChangesLog: [
                          {
                            newStatus: 'opened',
                            changeInitiator: 'getter',
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          {
                            newStatus: validBody.itemInteraction.status,
                            changeInitiator: interactingParty,
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                        ],
                        messagelog: [
                          {
                            messageText:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                            messageWriter: 'getter',
                            messageTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          validBody.itemInteraction.message
                            ? {
                                messageText: validBody.itemInteraction.message,
                                messageWriter: interactingParty,
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              }
                            : undefined,
                        ],
                        interestedParty: bobsUserId,
                        interactionStatus: validBody.itemInteraction.status,
                        dueDate: expect.any(String),
                        __v: expect.any(Number),
                      },
                    ],
                    commonCommunity:
                      interactingParty === 'getter'
                        ? {
                            _id: '6544be0f04b3ecd121538985',
                            picture:
                              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
                            name: 'our common community',
                          }
                        : null,
                    ownerData: null,
                  }); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
                  //  statusChangeLog with new entry, interactionStatus: 'declined',
                  //  messagelog includes new message, item.dueDate: null

                  // this does not yet check the dates sufficiently, thus
                  // the interactionDueDate is checked to be today by
                  expect(
                    new Date(updatedItem.interactions[0].dueDate)
                      .toISOString()
                      .split('T')[0],
                  ).toEqual(new Date().toISOString().split('T')[0]);
                  // further dates are set in other requests, which are tested elsewhere
                };

                // test: bodo4 creates an item,
                //  login bibi, open an interaction, decline an interaction, logout bibi,
                // login bob, open an interaction, logout bob
                // login bodo4, have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4
                const testForOwnerRequestingDeclinedOnOpenedStatusForSecondInteractionInArray =
                  async (
                    interactingParty: 'giver' | 'getter',
                    validItemInteractionBody: {
                      itemInteraction: ItemInteractionRequest;
                    },
                  ) => {
                    // define Body to be used in this test
                    const itemInteractionBody = validItemInteractionBody;

                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForRequestingDeclinedOnOpenedStatus',
                    );

                    // login bibi
                    const connectSidValueBibi = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi opens an interaction
                    const openItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItemForFirstInArray =
                      openItemInteractionResponseForFirstInArray.body[0]
                        .interactions[0]._id;

                    // bibi declines the interaction
                    const handleItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItemForFirstInArray}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'declined',
                            message:
                              'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login bob
                    const connectSidValueBob = await loginUser(
                      'bob@gmail.com',
                      'bob',
                    );

                    // bob opens an interaction
                    const openItemInteractionResponseForSecondInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBob}`]);
                    // extract interactionId
                    const interactionIdOnItemForSecondInArray =
                      openItemInteractionResponseForSecondInArray.body[0]
                        .interactions[0]._id;

                    // logout bob
                    await logout(connectSidValueBob);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // do request of interst
                    const handleItemInteractionResponse = await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItemForSecondInArray}`,
                      )
                      .send(itemInteractionBody)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    expectsForDeclinedOnOpenedSecondInteractionInArray(
                      interactingParty,
                      validItemInteractionBody,
                      handleItemInteractionResponse,
                    );
                  };

                await testForOwnerRequestingDeclinedOnOpenedStatusForSecondInteractionInArray(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 20000);
            });
            describe('requested by interestedParty', () => {
              // test: bodo4 creates an item, login bibi, have bibi open an interaction, have bibi do the request of interest, logout bibi,
              // login bodo4, delete all of bodo4's items, logout bodo4

              it('with message text and future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForDeclinedOnOpenedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 10000);

              it('if interaction is not interactions[0]', async () => {
                // expect statements for all tests in this block
                const expectsForDeclinedOnOpenedSecondInteractionInArray = (
                  interactingParty: 'giver' | 'getter',
                  validBody: { itemInteraction: ItemInteractionRequest },
                  itemInteractionResponse: request.Response,
                ) => {
                  // expects
                  expect(itemInteractionResponse.statusCode).toBe(200);
                  // expect the body array to only have one object inside
                  expect(itemInteractionResponse.body).toHaveLength(1);

                  // expect the body[0] to resemble the data inputs from validUpdateBody
                  const updatedItem = itemInteractionResponse.body[0];
                  expect(updatedItem.interactions.length).toBe(1); // for owner it's 2 here only the current interaction should be sent
                  expect(updatedItem).toEqual({
                    _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                    name: 'Item for testForRequestingDeclinedOnOpenedStatus',
                    available: true,
                    picture: null,
                    description: null,
                    categories: {
                      AdultClothing: {
                        name: 'Mode',
                        subcategories: [],
                      },
                      ChildAndBaby: {
                        name: 'Kind und Baby',
                        subcategories: [],
                      },
                      HouseAndGarden: {
                        name: 'Haus und Garten',
                        subcategories: [],
                      },
                      MediaAndGames: {
                        name: 'Medien und Spiele',
                        subcategories: [],
                      },
                      Other: {
                        name: 'Sonstiges',
                        subcategories: ['Sonstiges'],
                      },
                      SportAndCamping: {
                        name: 'Sport und Camping',
                        subcategories: [],
                      },
                      Technology: {
                        name: 'Technik und Zubehör',
                        subcategories: [],
                      },
                    },
                    dueDate: null,
                    owner: interactingParty === 'getter' ? false : true,
                    interactions: [
                      {
                        revealOwnerIdentity: false,
                        _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                        creationDate: expect.any(String),
                        statusChangesLog: [
                          {
                            newStatus: 'opened',
                            changeInitiator: 'getter',
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          {
                            newStatus: validBody.itemInteraction.status,
                            changeInitiator: interactingParty,
                            entryTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                        ],
                        messagelog: [
                          {
                            messageText:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                            messageWriter: 'getter',
                            messageTimestamp: expect.any(String),
                            _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                          },
                          validBody.itemInteraction.message
                            ? {
                                messageText: validBody.itemInteraction.message,
                                messageWriter: interactingParty,
                                messageTimestamp: expect.any(String),
                                _id: expect.any(String), // _id should be a mongo.Types.ObjectId, represented as a String
                              }
                            : undefined,
                        ],
                        interestedParty: bobsUserId,
                        interactionStatus: validBody.itemInteraction.status,
                        dueDate: expect.any(String),
                        __v: expect.any(Number),
                      },
                    ],
                    commonCommunity:
                      interactingParty === 'getter'
                        ? {
                            _id: '6544be0f04b3ecd121538985',
                            picture:
                              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
                            name: 'our common community',
                          }
                        : null,
                    ownerData: null,
                  }); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
                  //  statusChangeLog with new entry, interactionStatus: 'declined',
                  //  messagelog includes new message, item.dueDate: null

                  // this does not yet check the dates sufficiently, thus
                  // the interactionDueDate is checked to be today by
                  expect(
                    new Date(updatedItem.interactions[0].dueDate)
                      .toISOString()
                      .split('T')[0],
                  ).toEqual(new Date().toISOString().split('T')[0]);
                  // further dates are set in other requests, which are tested elsewhere
                };

                // test: bodo4 creates an item,
                //  login bibi, open an interaction, decline an interaction, logout bibi,
                // login bob, open an interaction, have bob do the request of interest, logout bob
                // login bodo4, delete all of bodo4's items, logout bodo4
                const testForInterestedPartyRequestingDeclinedOnOpenedStatusForSecondInteractionInArray =
                  async (
                    interactingParty: 'giver' | 'getter',
                    validItemInteractionBody: {
                      itemInteraction: ItemInteractionRequest;
                    },
                  ) => {
                    // define Body to be used in this test
                    const itemInteractionBody = validItemInteractionBody;

                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForRequestingDeclinedOnOpenedStatus',
                    );

                    // login bibi
                    const connectSidValueBibi = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi opens an interaction
                    const openItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItemForFirstInArray =
                      openItemInteractionResponseForFirstInArray.body[0]
                        .interactions[0]._id;

                    // bibi declines the interaction
                    const handleItemInteractionResponseForFirstInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItemForFirstInArray}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'declined',
                            message:
                              'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login bob
                    const connectSidValueBob = await loginUser(
                      'bob@gmail.com',
                      'bob',
                    );

                    // bob opens an interaction
                    const openItemInteractionResponseForSecondInArray =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 2 for testForRequestingDeclinedOnOpenedStatus',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBob}`]);
                    // extract interactionId
                    const interactionIdOnItemForSecondInArray =
                      openItemInteractionResponseForSecondInArray.body[0]
                        .interactions[0]._id;

                    // do request of interst
                    const handleItemInteractionResponse = await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItemForSecondInArray}`,
                      )
                      .send(itemInteractionBody)
                      .set('Cookie', [`connect.sid=${connectSidValueBob}`]);

                    // logout bob
                    await logout(connectSidValueBob);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    expectsForDeclinedOnOpenedSecondInteractionInArray(
                      interactingParty,
                      validItemInteractionBody,
                      handleItemInteractionResponse,
                    );
                  };

                await testForInterestedPartyRequestingDeclinedOnOpenedStatusForSecondInteractionInArray(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 20000);
            });

            it('and remove itemId from interestedParty.getItems and add it to interestedParty.getHistory', async () => {
              // expect statements for all tests in this block
              const expectsForDeclinedOnOpenedConcerningArraysOnUser = (
                itemId: string,
                authResponse: request.Response,
              ) => {
                // expects
                expect(authResponse.statusCode).toBe(200);

                //  itemId is only supposed to be in getHistory and none of the other arrays
                expect(authResponse.body.myItems).not.toContain(itemId);
                expect(authResponse.body.getItems).not.toContain(itemId);
                expect(authResponse.body.getHistory).toContain(itemId);
              };

              // test: bodo4 creates an item,
              //  login bibi, open an interaction, decline an interaction, get auth, logout bibi,
              // login bodo4, delete all of bodo4's items, logout bodo4
              const testForDeclinedOnOpenedConcerningArraysOnUser =
                async () => {
                  // bodo4 creates item
                  const itemId = await bodo4CreatesItem(
                    'testForRequestingDeclinedOnOpenedStatus',
                  );

                  // login bibi
                  const connectSidValueBibi = await loginUser(
                    'bibi@gmail.com',
                    'bibi',
                  );

                  // bibi opens an interaction
                  const openItemInteractionResponseForFirstInArray =
                    await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'opened',
                          message:
                            'opening interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                  // extract interactionId
                  const interactionIdOnItemForFirstInArray =
                    openItemInteractionResponseForFirstInArray.body[0]
                      .interactions[0]._id;

                  // bibi declines the interaction
                  const handleItemInteractionResponseForFirstInArray =
                    await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItemForFirstInArray}`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'declined',
                          message:
                            'declining interaction 1 for testForRequestingDeclinedOnOpenedStatus',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                  // bibi calles auth
                  const authResponse = await request(app)
                    .get(authRoute)
                    .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                  // logout bibi
                  await logout(connectSidValueBibi);

                  // login Bodo4
                  const connectSidValueBodo4Second = await loginBodo4();

                  // delete all items
                  const deleteAllOfUsersItemsResponse = await request(app)
                    .delete(itemRoute)
                    .set('Cookie', [
                      `connect.sid=${connectSidValueBodo4Second}`,
                    ]);

                  // logout
                  await logout(connectSidValueBodo4Second);

                  // console.log('authResponse', authResponse.body)
                  expectsForDeclinedOnOpenedConcerningArraysOnUser(
                    itemId,
                    authResponse,
                  );
                };

              await testForDeclinedOnOpenedConcerningArraysOnUser();
            }, 20000);
          });

          describe('for status accepted', () => {
            // expect statements for all tests in this block
            const expectsForAcceptedOnOpened = (
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
              getShowItemResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );
              // console.log('getShowItemResponse.body', getShowItemResponse.text);
              // expects

              // for the itemInteractionResponse
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItemForOwner = itemInteractionResponse.body[0];
              expect(updatedItemForOwner).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnOpened(
                  'giver',
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog with new entry, interactionStatus: 'accepted',
              //  messagelog includes new message, item.dueDate: some date

              // this does not yet check the dates sufficiently, thus
              // the interactionDueDate is checked to be what the owner set

              const givenDueDate = itemInteractionBody.itemInteraction.dueDate;
              const noGivenDate = getFutureDateForBody(2);

              if (givenDueDate && new Date(givenDueDate) >= new Date()) {
                // console.log('if with valid due Date');
                expect(
                  new Date(updatedItemForOwner.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(givenDueDate);
                expect(
                  new Date(updatedItemForOwner.dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(givenDueDate);
              } else {
                // console.log('if withOUT due Date/ no valid due Date');
                expect(
                  new Date(updatedItemForOwner.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(noGivenDate);
                expect(
                  new Date(updatedItemForOwner.dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(noGivenDate);
              }
              // further dates are set in other requests, which are tested elsewhere

              // expects
              // for the getShowItemResponse from bibi
              expect(getShowItemResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(getShowItemResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody and show the ownerData
              const updatedItemForInterestedParty = getShowItemResponse.body[0];
              expect(updatedItemForInterestedParty).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnOpened(
                  'getter',
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog with second entry, interactionStatus: 'accepted',
              //  messagelog includes message from owner, item.dueDate: some date
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'accepted',
                message: '', // empty string
                dueDate: getFutureDateForBody(4),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'accepted',
                // message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                // dueDate: getFutureDateForBody(4),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item,
            // bibi opens interaction,
            // login bodo4, have bodo4 do the request of interest, logout bodo4
            // login bibi, have bibi view the item, logout bibi,
            // login bodo4, delete all of bodo4's items, logout bodo4
            const testForAcceptedOnOpenedStatus =
              async (validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              }) => {
                // define Body to be used in this test
                const itemInteractionBody = validItemInteractionBody;

                // bodo4 creates item
                const itemId = await bodo4CreatesItem(
                  'testForRequestingAcceptedOnOpenedStatus',
                );

                // bibi opens interaction
                const interactionIdOnItem = await bibiOpensInteraction(
                  itemId,
                  'testForRequestingAcceptedOnOpenedStatus',
                );

                // login Bodo4
                const connectSidValueBodo4Second = await loginBodo4();

                // do request of interst
                const handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

                // logout
                await logout(connectSidValueBodo4Second);

                // login bibi
                const connectSidValueBibiSecond = await loginUser(
                  'bibi@gmail.com',
                  'bibi',
                );

                // bibi views the item
                const getShowItemResponse = await request(app)
                  .get(`${itemRoute}/${itemId}`)
                  .set('Cookie', [`connect.sid=${connectSidValueBibiSecond}`]);

                // logout bibi
                await logout(connectSidValueBibiSecond);

                // login Bodo4
                const connectSidValueBodo4Third = await loginBodo4();

                // delete all items
                const deleteAllOfUsersItemsResponse = await request(app)
                  .delete(itemRoute)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

                // logout
                await logout(connectSidValueBodo4Third);

                expectsForAcceptedOnOpened(
                  validItemInteractionBody,
                  handleItemInteractionResponse,
                  getShowItemResponse,
                );
              };

            describe('requested by owner', () => {
              // test: bodo4 creates an item,
              // bibi opens interaction,
              // login bodo4, have bodo4 do the request of interest, logout bodo4
              // login bibi, have bibi view the item, logout bibi,
              // login bodo4, delete all of bodo4's items, logout bodo4

              it('with message text and future dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody1);
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody2);
              }, 20000);

              it('with no message but a future dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody3);
              }, 20000);

              it('with message text and a past dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody4);
              }, 20000);

              it('with message text and no dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody5);
              }, 20000);

              it('with message text and empty string for dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody6);
              }, 20000);

              it('with message text and today for dueDate', async () => {
                await testForAcceptedOnOpenedStatus(validItemInteractionBody7);
              }, 20000);
            });
          });
        });
      });
      describe('for current interactionStatus is accepted', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request

          // test: bodo4 creates an item,
          // bibi opens interaction,
          // login bodo4, accept interaction, [if giver: get showItem, have bodo4 do the request of interest, get showItem,] logout bodo4,
          // [if getter: login bibi, get showItem, have bibi do the request of interest, get showItem, logout bibi,]
          // login bodo4, delete all of bodo4's items, logout bodo4
          const testForRequestingWrongStatusOnAccepted = async (
            interactingParty: 'giver' | 'getter',
            statusCode: number,
            invalidity: string,
            validItemInteractionBody: {
              itemInteraction: ItemInteractionRequest;
            },
          ) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(
              'testForRequestingWrongStatusOnAccepted',
            );

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              'testForRequestingWrongStatusOnAccepted',
            );

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            // bodo4 accepts interaction
            const handleItemInteractionResponseAccepting = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}`,
              )
              .send({
                itemInteraction: {
                  status: 'accepted',
                  message:
                    'accepting interaction for testForRequestingWrongStatusOnAccepted',
                  dueDate: getFutureDateForBody(4),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            let getShowItemResponseBefore: any = undefined;
            let handleItemInteractionResponse: any = undefined;
            let getShowItemResponseAfter: any = undefined;
            if (interactingParty === 'giver') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
            }

            // logout
            await logout(connectSidValueBodo4Second);

            if (interactingParty === 'getter') {
              // login bibi
              const connectSidValueBibi = await loginUser(
                'bibi@gmail.com',
                'bibi',
              );

              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // logout bibi
              await logout(connectSidValueBibi);
            }

            // login Bodo4
            const connectSidValueBodo4Third = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

            // logout
            await logout(connectSidValueBodo4Third);

            expect(getShowItemResponseBefore.body[0]).not.toBe(undefined);
            expect(getShowItemResponseBefore.body[0]).toEqual(
              getShowItemResponseAfter.body[0],
            );

            expectsForError(
              statusCode,
              invalidity,
              handleItemInteractionResponse,
            );
          };

          describe('when owner', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test
            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyDeclined = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status declined', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyDeclined,
              );
            }, 20000);
          });
          describe('when interestedParty', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test

            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodydeclined = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status declined', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodydeclined,
              );
            }, 10000);

            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatusOnAccepted(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
              );
            }, 10000);
          });
        });
        describe('should respond successful with a statusCode200 and item data', () => {
          describe('for status accepted', () => {
            // expect statements for all tests in this block
            const expectsForAcceptedOnAccepted = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );

              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientAcceptedOnAccepted(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog no new entry, interactionStatus: 'accepted',
              //  messagelog includes new message, item.dueDate: present and checked by following expects

              // the above does not yet check the dates sufficiently, thus
              // item.dueDate: possibly changed for giver/same as before for getter
              // the interactionDueDate is checked to be the same as on opening by bibi
              // for interactingParty = getter and if owner sent not valid or no dueDate
              // or the interactionDueDate is checked to as set by the owner for valid dueDate

              const bodosInteractionAcceptanceDueDate = getFutureDateForBody(4); // set in the test by bodo4 in the interaction acceptance request
              const givenDueDate = itemInteractionBody.itemInteraction.dueDate;

              if (
                interactingParty === 'giver' &&
                givenDueDate &&
                new Date(givenDueDate) >= new Date()
              ) {
                // console.log('if with valid due Date');
                expect(
                  new Date(updatedItem.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(givenDueDate);
                expect(
                  new Date(updatedItem.dueDate).toISOString().split('T')[0],
                ).toEqual(givenDueDate);
              } else {
                // console.log('if withOUT due Date/ no valid due Date or getter');
                expect(
                  new Date(updatedItem.interactions[0].dueDate)
                    .toISOString()
                    .split('T')[0],
                ).toEqual(bodosInteractionAcceptanceDueDate);
                expect(
                  new Date(updatedItem.dueDate).toISOString().split('T')[0],
                ).toEqual(bodosInteractionAcceptanceDueDate);
              }
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'accepted',
                message: '', // empty string
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'accepted',
                // message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                // dueDate: getFutureDateForBody(3/7),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item,
            // bibi opens interaction,
            // login bodo4, accept interaction, [if giver: have bodo4 do the request of interest,] logout bodo4,
            // [if getter: login bibi, have bibi do the request of interest, logout bibi,]
            // login bodo4, delete all of bodo4's items, logout bodo4
            const testForRequestingAcceptedOnAcceptedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingAcceptedOnAcceptedStatus',
              );

              // bibi opens interaction
              const interactionIdOnItem = await bibiOpensInteraction(
                itemId,
                'testForRequestingAcceptedOnAcceptedStatus',
              );

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              // bodo4 accepts interaction
              const handleItemInteractionResponseAccepting = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'accepted',
                    message:
                      'accepting interaction for testForRequestingAcceptedOnAcceptedStatus',
                    dueDate: getFutureDateForBody(4),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              let handleItemInteractionResponse: any = undefined;
              if (interactingParty === 'giver') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              }

              // logout
              await logout(connectSidValueBodo4Second);

              if (interactingParty === 'getter') {
                // login bibi
                const connectSidValueBibi = await loginUser(
                  'bibi@gmail.com',
                  'bibi',
                );

                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                // logout bibi
                await logout(connectSidValueBibi);
              }

              // login Bodo4
              const connectSidValueBodo4Third = await loginBodo4();

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

              // logout
              await logout(connectSidValueBodo4Third);

              expectsForAcceptedOnAccepted(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner - possibly changing dueDate', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);
            });

            describe('requested by interestedParty', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 20000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 20000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 20000);

              it('with message text and no dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 20000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 20000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingAcceptedOnAcceptedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 20000);
            });
          });
          describe('for status closed', () => {
            // expect statements for all tests in this block
            const expectsForClosedOnAccepted = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );

              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientClosedOnAccepted(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: false, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog no new entry, interactionStatus: 'accepted',
              //  messagelog includes new message, item.dueDate: null

              // the above does not yet check if interaction dueDate still what it was before, thus
              const bodosInteractionAcceptanceDueDate = getFutureDateForBody(4); // set in the test by bodo4 in the interaction acceptance request

              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(bodosInteractionAcceptanceDueDate);
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'closed',
                message: '', // empty string
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'closed',
                // message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                // dueDate: getFutureDateForBody(3/7),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item,
            // bibi opens interaction,
            // login bodo4, accept interaction, have bodo4 do the request of interest, delete all of bodo4's items, logout bodo4,
            const testForRequestingClosedOnAcceptedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingClosedOnAcceptedStatus',
              );

              // bibi opens interaction
              const interactionIdOnItem = await bibiOpensInteraction(
                itemId,
                'testForRequestingClosedOnAcceptedStatus',
              );

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              // bodo4 accepts interaction
              const handleItemInteractionResponseAccepting = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'accepted',
                    message:
                      'accepting interaction for testForRequestingClosedOnAcceptedStatus',
                    dueDate: getFutureDateForBody(4),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // do request of interst
              const handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expectsForClosedOnAccepted(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingClosedOnAcceptedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);

              it('and remove itemId from interestedParty.getItems and add it to interestedParty.getHistory', async () => {
                // expect statement
                const expectsForClosedOnAcceptedConcerningArraysOnUser = (
                  itemId: string,
                  authResponseAfterOpening: request.Response,
                  authResponseAfterClosing: request.Response,
                ) => {
                  // expects
                  expect(authResponseAfterOpening.statusCode).toBe(200);

                  //  itemId is only supposed to be in getItems and none of the other arrays after opening
                  expect(authResponseAfterOpening.body.myItems).not.toContain(
                    itemId,
                  );
                  expect(authResponseAfterOpening.body.getItems).toContain(
                    itemId,
                  );
                  expect(
                    authResponseAfterOpening.body.getHistory,
                  ).not.toContain(itemId);

                  // expects
                  expect(authResponseAfterClosing.statusCode).toBe(200);

                  //  itemId is only supposed to not be in getItems after closing, but be moved to getHistory
                  expect(authResponseAfterClosing.body.myItems).not.toContain(
                    itemId,
                  );
                  expect(authResponseAfterClosing.body.getItems).not.toContain(
                    itemId,
                  );
                  expect(authResponseAfterClosing.body.getHistory).toContain(
                    itemId,
                  );
                };

                // test: bodo4 creates an item,
                // login bibi, open an interaction, get auth, logout bibi,
                // login bodo4, accept interaction, close interaction, logout bodo4,
                // login bibi, get auth, logout bibi,
                // login bodo4, delete all of bodo4's items, logout bodo4,
                const testForClosedOnAcceptedConcerningArraysOnUser =
                  async () => {
                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForClosedOnAcceptedConcerningArraysOnUser',
                    );

                    // login bibi
                    const connectSidValueBibi = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi opens an interaction
                    const openItemInteractionResponse = await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'opened',
                          message:
                            'opening interaction for testForClosedOnAcceptedConcerningArraysOnUser',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItem =
                      openItemInteractionResponse.body[0].interactions[0]._id;

                    // bibi calles auth
                    const authResponseBibiPastOpening = await request(app)
                      .get(authRoute)
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // bodo4 accepts the interaction
                    const handleItemInteractionResponseAccepting =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItem}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'accepted',
                            message:
                              'accepting interaction for testForClosedOnAcceptedConcerningArraysOnUser',
                            dueDate: getFutureDateForBody(4),
                          },
                        })
                        .set('Cookie', [
                          `connect.sid=${connectSidValueBodo4Second}`,
                        ]);

                    // bodo4 closes the interaction
                    const handleItemInteractionResponseClosing = await request(
                      app,
                    )
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItem}`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'closed',
                          message:
                            'closing interaction for testForClosedOnAcceptedConcerningArraysOnUser',
                          dueDate: getFutureDateForBody(4),
                        },
                      })
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    // login bibi
                    const connectSidValueBibiSesond = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi calles auth
                    const authResponseBibiPastClosing = await request(app)
                      .get(authRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBibiSesond}`,
                      ]);

                    // logout bibi
                    await logout(connectSidValueBibiSesond);

                    // login Bodo4
                    const connectSidValueBodo4Third = await loginBodo4();

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Third}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Third);

                    // console.log(
                    //   'authResponseBibiPastOpening',
                    //   authResponseBibiPastOpening.body,
                    // );
                    // console.log(
                    //   'authResponseBibiPastClosing',
                    //   authResponseBibiPastClosing.body,
                    // );
                    expectsForClosedOnAcceptedConcerningArraysOnUser(
                      itemId,
                      authResponseBibiPastOpening,
                      authResponseBibiPastClosing,
                    );
                  };

                await testForClosedOnAcceptedConcerningArraysOnUser();
              }, 20000);

              it('and remove itemId from interestedParty.getItems and NOT add it to interestedParty.getHistory if it already is in getHistory', async () => {
                // expect statement when previous to the accepted interaction, there was another interaction on the item
                const expectsForClosedOnAcceptedConcerningArraysOnUserSecondInteraction =
                  (
                    itemId: string,
                    authResponseAfterOpening: request.Response,
                    authResponseAfterClosing: request.Response,
                  ) => {
                    // expects
                    expect(authResponseAfterOpening.statusCode).toBe(200);

                    //  itemId is supposed to be in getItems and get History
                    expect(authResponseAfterOpening.body.myItems).not.toContain(
                      itemId,
                    );
                    expect(authResponseAfterOpening.body.getItems).toContain(
                      itemId,
                    );
                    expect(authResponseAfterOpening.body.getHistory).toContain(
                      itemId,
                    );

                    // expects
                    expect(authResponseAfterClosing.statusCode).toBe(200);

                    //  itemId is only supposed to not be in getItems after closing, but be moved to getHistory
                    expect(authResponseAfterClosing.body.myItems).not.toContain(
                      itemId,
                    );
                    expect(
                      authResponseAfterClosing.body.getItems,
                    ).not.toContain(itemId);
                    expect(authResponseAfterClosing.body.getHistory).toContain(
                      itemId,
                    );
                    expect(
                      authResponseAfterClosing.body.getHistory.filter(
                        (item: any) => item === itemId,
                      ),
                    ).toHaveLength(1);
                  };

                // test: bodo4 creates an item,
                // login bibi, open an interaction, decline the interaction, open another interaction, get auth, logout bibi,
                // login bodo4, accept interaction, close interaction, logout bodo4,
                // login bibi, get auth, logout bibi,
                // login bodo4, delete all of bodo4's items, logout bodo4,
                const testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction =
                  async () => {
                    // bodo4 creates item
                    const itemId = await bodo4CreatesItem(
                      'testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                    );

                    // login bibi
                    const connectSidValueBibi = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi opens first interaction
                    const openItemInteractionResponseFirstInteraction =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'opened',
                            message:
                              'opening interaction 1 for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItemFirstInteraction =
                      openItemInteractionResponseFirstInteraction.body[0]
                        .interactions[0]._id;

                    // bibi declines this first interaction
                    const handleItemInteractionResponseDeclining =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItemFirstInteraction}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'declined',
                            message:
                              'declining interaction 1 for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                          },
                        })
                        .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // bibi opens another interaction
                    const openItemInteractionResponse = await request(app)
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'opened',
                          message:
                            'opening interaction 2 for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                        },
                      })
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
                    // extract interactionId
                    const interactionIdOnItem =
                      openItemInteractionResponse.body[0].interactions[0]._id;

                    // bibi calles auth
                    const authResponseBibiPastOpening = await request(app)
                      .get(authRoute)
                      .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                    // logout bibi
                    await logout(connectSidValueBibi);

                    // login Bodo4
                    const connectSidValueBodo4Second = await loginBodo4();

                    // bodo4 accepts the interaction
                    const handleItemInteractionResponseAccepting =
                      await request(app)
                        .post(
                          `${itemRoute}/${itemId}/${
                            itemIdInteractionRoute
                              .split(':itemId/')
                              .slice(-1)[0]
                          }/${interactionIdOnItem}`,
                        )
                        .send({
                          itemInteraction: {
                            status: 'accepted',
                            message:
                              'accepting interaction for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                            dueDate: getFutureDateForBody(4),
                          },
                        })
                        .set('Cookie', [
                          `connect.sid=${connectSidValueBodo4Second}`,
                        ]);

                    // bodo4 closes the interaction
                    const handleItemInteractionResponseClosing = await request(
                      app,
                    )
                      .post(
                        `${itemRoute}/${itemId}/${
                          itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                        }/${interactionIdOnItem}`,
                      )
                      .send({
                        itemInteraction: {
                          status: 'closed',
                          message:
                            'closing interaction for testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction',
                          dueDate: getFutureDateForBody(4),
                        },
                      })
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Second}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Second);

                    // login bibi
                    const connectSidValueBibiSesond = await loginUser(
                      'bibi@gmail.com',
                      'bibi',
                    );

                    // bibi calles auth
                    const authResponseBibiPastClosing = await request(app)
                      .get(authRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBibiSesond}`,
                      ]);

                    // logout bibi
                    await logout(connectSidValueBibiSesond);

                    // login Bodo4
                    const connectSidValueBodo4Third = await loginBodo4();

                    // delete all items
                    const deleteAllOfUsersItemsResponse = await request(app)
                      .delete(itemRoute)
                      .set('Cookie', [
                        `connect.sid=${connectSidValueBodo4Third}`,
                      ]);

                    // logout
                    await logout(connectSidValueBodo4Third);

                    // console.log(
                    //   'authResponseBibiPastOpening',
                    //   authResponseBibiPastOpening.body,
                    // );
                    // console.log(
                    //   'authResponseBibiPastClosing',
                    //   authResponseBibiPastClosing.body,
                    // );
                    expectsForClosedOnAcceptedConcerningArraysOnUserSecondInteraction(
                      itemId,
                      authResponseBibiPastOpening,
                      authResponseBibiPastClosing,
                    );
                  };

                await testForClosedOnAcceptedConcerningArraysOnUserSecondInteraction();
              }, 20000);
            });
          });
        });
      });

      describe('for current interactionStatus is declined', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request

          // test: bodo4 creates an item,
          // login bibi, have bibi open an interaction, have bibi decline the interaction, [if getter: get showItem,  have bibi do the request of interest, get showItem,], logout bibi,
          // login bodo4, [if giver: get showItem,  have bodo4 do the request of interest, get showItem,] delete all of bodo4's items, logout bodo4,
          const testForRequestingWrongStatusOnDeclined = async (
            interactingParty: 'giver' | 'getter',
            statusCode: number,
            invalidity: string,
            validItemInteractionBody: {
              itemInteraction: ItemInteractionRequest;
            },
          ) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(
              'testForRequestingWrongStatusOnDeclined',
            );

            // login bibi
            const connectSidValueBibi = await loginUser(
              'bibi@gmail.com',
              'bibi',
            );

            // bibi opens an interaction
            const openItemInteractionResponse = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }`,
              )
              .send({
                itemInteraction: {
                  status: 'opened',
                  message:
                    'opening interaction for testForRequestingWrongStatusOnDeclined',
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            // extract interactionId
            const interactionIdOnItem =
              openItemInteractionResponse.body[0].interactions[0]._id;

            //bibi declines the interaction
            const handleItemInteractionResponseDeclining = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}`,
              )
              .send({
                itemInteraction: {
                  status: 'declined',
                  message:
                    'declining interaction for testForRequestingWrongStatusOnDeclined',
                  dueDate: getFutureDateForBody(4),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

            let getShowItemResponseBefore: any = undefined;
            let handleItemInteractionResponse: any = undefined;
            let getShowItemResponseAfter: any = undefined;
            if (interactingParty === 'getter') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
            }

            // logout bibi
            await logout(connectSidValueBibi);

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            if (interactingParty === 'giver') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
            }

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // logout
            await logout(connectSidValueBodo4Second);

            expect(getShowItemResponseBefore.body[0]).not.toBe(undefined);
            expect(getShowItemResponseBefore.body[0]).toEqual(
              getShowItemResponseAfter.body[0],
            );

            expectsForError(
              statusCode,
              invalidity,
              handleItemInteractionResponse,
            );
          };

          describe('when owner', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test
            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 20000);

            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
              );
            }, 20000);
          });
          describe('when interestedParty', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test

            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 20000);

            const validItemInteractionBodyClosed = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status closed', async () => {
              await testForRequestingWrongStatusOnDeclined(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyClosed,
              );
            }, 20000);
          });
        });
        describe('should respond successful with a statusCode200 and item data', () => {
          describe('for status declined', () => {
            // expect statements for all tests in this block
            const expectsForDeclinedOnDeclined = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );

              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientDeclinedOnDeclined(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: true, revealOwnerIdentity: false, ownerData: null,
              //  statusChangeLog no new entry, interactionStatus: 'declined',
              //  messagelog includes new message, item.dueDate: null

              // the above does not yet check the interaction.dueDate sufficiently,
              // it should not have changed from what it was set upon declining

              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(new Date().toISOString().split('T')[0]);
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'declined',
                message: '', // empty string
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'declined',
                // message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                // dueDate: getFutureDateForBody(3/7),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item,
            // login bibi, have bibi open an interaction, decline interaction, [if getter: have bibi do the request of interest] logout bibi,
            // login bodo4,  [if giver: have bodo4 do the request of interest,]  delete all of bodo4's items, logout bodo4,
            const testForRequestingDeclinedOnDeclinedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingDeclinedOnDeclinedStatus',
              );

              // login bibi
              const connectSidValueBibi = await loginUser(
                'bibi@gmail.com',
                'bibi',
              );

              // bibi opens an interaction
              const openItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }`,
                )
                .send({
                  itemInteraction: {
                    status: 'opened',
                    message:
                      'opening interaction for testForRequestingDeclinedOnDeclinedStatus',
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              // extract interactionId
              const interactionIdOnItem =
                openItemInteractionResponse.body[0].interactions[0]._id;

              // bibi declines interaction
              const handleItemInteractionResponseDeclining = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'declined',
                    message:
                      'declining interaction for testForRequestingDeclinedOnDeclinedStatus',
                    dueDate: getFutureDateForBody(4),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              let handleItemInteractionResponse: any = undefined;

              if (interactingParty === 'getter') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);
              }

              // logout bibi
              await logout(connectSidValueBibi);

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              if (interactingParty === 'giver') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              }

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // logout
              await logout(connectSidValueBodo4Second);

              expectsForDeclinedOnDeclined(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);
            });

            describe('requested by interestedParty', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 20000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 20000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 20000);

              it('with message text and no dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 20000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 20000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingDeclinedOnDeclinedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 20000);
            });
          });
        });
      });
      describe('for current interactionStatus is closed', () => {
        describe('should respond error with a statusCode400', () => {
          // check for the interaction to be exactly the same as before the request

          // test: bodo4 creates an item,
          // bibi opens interaction,
          // login bodo4, accept interaction, close interaction, [if giver: get showItem, have bodo4 do the request of interest, get showItem,] logout bodo4,
          // [if getter: login bibi, get showItem, have bibi do the request of interest, get showItem, logout bibi,]
          // login bodo4, delete all of bodo4's items, logout bodo4
          const testForRequestingWrongStatusOnClosed = async (
            interactingParty: 'giver' | 'getter',
            statusCode: number,
            invalidity: string,
            validItemInteractionBody: {
              itemInteraction: ItemInteractionRequest;
            },
          ) => {
            // define Body to be used in this test
            const itemInteractionBody = validItemInteractionBody;

            // bodo4 creates item
            const itemId = await bodo4CreatesItem(
              'testForRequestingWrongStatusOnClosed',
            );

            // bibi opens interaction
            const interactionIdOnItem = await bibiOpensInteraction(
              itemId,
              'testForRequestingWrongStatusOnClosed',
            );

            // login Bodo4
            const connectSidValueBodo4Second = await loginBodo4();

            // bodo4 accepts interaction
            const handleItemInteractionResponseAccepting = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}`,
              )
              .send({
                itemInteraction: {
                  status: 'accepted',
                  message:
                    'accepting interaction for testForRequestingWrongStatusOnClosed',
                  dueDate: getFutureDateForBody(4),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            // bodo4 closes interaction
            const handleItemInteractionResponseClosing = await request(app)
              .post(
                `${itemRoute}/${itemId}/${
                  itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                }/${interactionIdOnItem}`,
              )
              .send({
                itemInteraction: {
                  status: 'closed',
                  message:
                    'closing interaction for testForRequestingWrongStatusOnClosed',
                  dueDate: getFutureDateForBody(4),
                },
              })
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

            let getShowItemResponseBefore: any = undefined;
            let handleItemInteractionResponse: any = undefined;
            let getShowItemResponseAfter: any = undefined;
            if (interactingParty === 'giver') {
              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
            }

            // logout
            await logout(connectSidValueBodo4Second);

            if (interactingParty === 'getter') {
              // login bibi
              const connectSidValueBibi = await loginUser(
                'bibi@gmail.com',
                'bibi',
              );

              //getShowItem before request of interest
              getShowItemResponseBefore = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // do request of interst
              handleItemInteractionResponse = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send(itemInteractionBody)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              //getShowItem after request of interest
              getShowItemResponseAfter = await request(app)
                .get(`${itemRoute}/${itemId}`)
                .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

              // logout bibi
              await logout(connectSidValueBibi);
            }

            // login Bodo4
            const connectSidValueBodo4Third = await loginBodo4();

            // delete all items
            const deleteAllOfUsersItemsResponse = await request(app)
              .delete(itemRoute)
              .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

            // logout
            await logout(connectSidValueBodo4Third);

            expect(getShowItemResponseBefore.body[0]).not.toBe(undefined);
            expect(getShowItemResponseBefore.body[0]).toEqual(
              getShowItemResponseAfter.body[0],
            );

            expectsForError(
              statusCode,
              invalidity,
              handleItemInteractionResponse,
            );
          };

          describe('when owner', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test
            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnClosed(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForRequestingWrongStatusOnClosed(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 20000);

            const validItemInteractionBodyDeclined = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status declined', async () => {
              await testForRequestingWrongStatusOnClosed(
                'giver',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyDeclined,
              );
            }, 20000);
          });
          describe('when interestedParty', () => {
            // one could now test all sorts of valid bodies, but the test already checks,
            //  if the showItem before and after the tested route are equal.
            // If any of the changes suggested by the request were done, this should lead to failing the test

            const validItemInteractionBodyOpened = {
              itemInteraction: {
                status: 'opened',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status opened', async () => {
              await testForRequestingWrongStatusOnClosed(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyOpened,
              );
            }, 20000);

            const validItemInteractionBodyAccepted = {
              itemInteraction: {
                status: 'accepted',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status accepted', async () => {
              await testForRequestingWrongStatusOnClosed(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyAccepted,
              );
            }, 20000);

            const validItemInteractionBodyDeclined = {
              itemInteraction: {
                status: 'declined',
                message: 'some string',
                dueDate: getFutureDateForBody(4),
              },
            };
            it('requests status declined', async () => {
              await testForRequestingWrongStatusOnClosed(
                'getter',
                400,
                'Error: Bad Request: The requested change on the interaction is not allowed',
                validItemInteractionBodyDeclined,
              );
            }, 10000);
          });
        });

        describe('should respond successful with a statusCode200 and item data', () => {
          describe('for status closed', () => {
            // expect statements for all tests in this block
            const expectsForClosedOnClosed = (
              interactingParty: 'giver' | 'getter',
              itemInteractionBody: { itemInteraction: ItemInteractionRequest },
              itemInteractionResponse: request.Response,
            ) => {
              // console.log(
              //   'itemInteractionResponse.body',
              //   itemInteractionResponse.text,
              // );

              // expects
              expect(itemInteractionResponse.statusCode).toBe(200);
              // expect the body array to only have one object inside
              expect(itemInteractionResponse.body).toHaveLength(1);

              // expect the body[0] to resemble the data inputs from validUpdateBody
              const updatedItem = itemInteractionResponse.body[0];
              expect(updatedItem).toEqual(
                checkResponseToBeCorrectlyProcessedItemForClientClosedOnClosed(
                  interactingParty,
                  itemInteractionBody,
                ),
              ); // checks: availble: true, revealOwnerIdentity: true, ownerData: null for giver/object for getter,
              //  statusChangeLog no new entry, interactionStatus: 'closed',
              //  messagelog includes new message, item.dueDate: null

              // the above does not yet check the interaction.dueDate sufficiently,
              // it should not have changed from what it was set upon declining

              expect(
                new Date(updatedItem.interactions[0].dueDate)
                  .toISOString()
                  .split('T')[0],
              ).toEqual(getFutureDateForBody(4)); // what bodo4 sets upon accepting the interaction
            };

            // valid to be tested bodies:
            // with message text and future dueDate
            const validItemInteractionBody1 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with empty message text and a future dueDate
            const validItemInteractionBody2 = {
              itemInteraction: {
                status: 'closed',
                message: '', // empty string
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with no message but a future dueDate
            const validItemInteractionBody3 = {
              itemInteraction: {
                status: 'closed',
                // message: 'some string',
                dueDate: getFutureDateForBody(3 / 7),
              },
            };
            // with message text and a past dueDate
            const validItemInteractionBody4 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: '2022-10-12',
              },
            };
            // with message text and no dueDate
            const validItemInteractionBody5 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                // dueDate: getFutureDateForBody(3/7),
              },
            };
            // with message text and empty string for dueDate
            const validItemInteractionBody6 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: '', // empty string
              },
            };
            // with message text and today for dueDate
            const validItemInteractionBody7 = {
              itemInteraction: {
                status: 'closed',
                message: 'some string',
                dueDate: new Date().toISOString().split('T')[0],
              },
            };

            // test: bodo4 creates an item,
            // bibi opens interaction,
            // login bodo4, accept interaction, close interaction, [if giver: have bodo4 do the request of interest,] logout bodo4,
            // [if getter: login bibi, have bibi do the request of interest, logout bibi,]
            // login bodo4, delete all of bodo4's items, logout bodo4
            const testForRequestingClosedOnClosedStatus = async (
              interactingParty: 'giver' | 'getter',
              validItemInteractionBody: {
                itemInteraction: ItemInteractionRequest;
              },
            ) => {
              // define Body to be used in this test
              const itemInteractionBody = validItemInteractionBody;

              // bodo4 creates item
              const itemId = await bodo4CreatesItem(
                'testForRequestingClosedOnClosedStatus',
              );

              // bibi opens interaction
              const interactionIdOnItem = await bibiOpensInteraction(
                itemId,
                'testForRequestingClosedOnClosedStatus',
              );

              // login Bodo4
              const connectSidValueBodo4Second = await loginBodo4();

              // bodo4 accepts interaction
              const handleItemInteractionResponseAccepting = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'accepted',
                    message:
                      'accepting interaction for testForRequestingClosedOnClosedStatus',
                    dueDate: getFutureDateForBody(4),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              // bodo4 closes interaction
              const handleItemInteractionResponseClosing = await request(app)
                .post(
                  `${itemRoute}/${itemId}/${
                    itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                  }/${interactionIdOnItem}`,
                )
                .send({
                  itemInteraction: {
                    status: 'closed',
                    message:
                      'closing interaction for testForRequestingClosedOnClosedStatus',
                    dueDate: getFutureDateForBody(3),
                  },
                })
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);

              let handleItemInteractionResponse: any = undefined;
              if (interactingParty === 'giver') {
                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBodo4Second}`]);
              }

              // logout
              await logout(connectSidValueBodo4Second);

              if (interactingParty === 'getter') {
                // login bibi
                const connectSidValueBibi = await loginUser(
                  'bibi@gmail.com',
                  'bibi',
                );

                // do request of interst
                handleItemInteractionResponse = await request(app)
                  .post(
                    `${itemRoute}/${itemId}/${
                      itemIdInteractionRoute.split(':itemId/').slice(-1)[0]
                    }/${interactionIdOnItem}`,
                  )
                  .send(itemInteractionBody)
                  .set('Cookie', [`connect.sid=${connectSidValueBibi}`]);

                // logout bibi
                await logout(connectSidValueBibi);
              }

              // login Bodo4
              const connectSidValueBodo4Third = await loginBodo4();

              // delete all items
              const deleteAllOfUsersItemsResponse = await request(app)
                .delete(itemRoute)
                .set('Cookie', [`connect.sid=${connectSidValueBodo4Third}`]);

              // logout
              await logout(connectSidValueBodo4Third);

              expectsForClosedOnClosed(
                interactingParty,
                validItemInteractionBody,
                handleItemInteractionResponse,
              );
            };

            describe('requested by owner', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'giver',
                  validItemInteractionBody1,
                );
              }, 10000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'giver',
                  validItemInteractionBody2,
                );
              }, 10000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'giver',
                  validItemInteractionBody3,
                );
              }, 10000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'giver',
                  validItemInteractionBody4,
                );
              }, 10000);

              it('with message text and no dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'giver',
                  validItemInteractionBody5,
                );
              }, 10000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'giver',
                  validItemInteractionBody6,
                );
              }, 10000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'giver',
                  validItemInteractionBody7,
                );
              }, 10000);
            });

            describe('requested by interestedParty', () => {
              it('with message text and future dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'getter',
                  validItemInteractionBody1,
                );
              }, 20000);

              it('with empty message text and a future dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'getter',
                  validItemInteractionBody2,
                );
              }, 20000);

              it('with no message but a future dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'getter',
                  validItemInteractionBody3,
                );
              }, 20000);

              it('with message text and a past dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'getter',
                  validItemInteractionBody4,
                );
              }, 20000);

              it('with message text and no dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'getter',
                  validItemInteractionBody5,
                );
              }, 20000);

              it('with message text and empty string for dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'getter',
                  validItemInteractionBody6,
                );
              }, 20000);

              it('with message text and today for dueDate', async () => {
                await testForRequestingClosedOnClosedStatus(
                  'getter',
                  validItemInteractionBody7,
                );
              }, 20000);
            });
          });
        });
      });
    });
  });

  describe('DELETE all items', () => {
    it('should delete all of bodo4s items', async () => {
      // login bodo4
      const connectSidValue = await loginBodo4();
      // create item as bodo4
      const deleteAllOfUsersItemsResponse = await request(app)
        .delete(itemRoute)
        .set('Cookie', [`connect.sid=${connectSidValue}`]);
      // logout bodo4
      await logout(connectSidValue);

      expect([
        'You had no items to delete.',
        'Successfully deleted all of your items!',
      ]).toEqual(expect.arrayContaining([deleteAllOfUsersItemsResponse.text]));

      console.log(
        'all tests in itemInteractionIdRoutesPOST-handleInteraction.test.ts ran',
      );
    }, 10000);
  });
});
