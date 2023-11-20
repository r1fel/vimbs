import mongoose, { Document } from 'mongoose';

// Extension of Express.User, so that req.user._id can be used
declare global {
  namespace Express {
    interface User {
      _id: mongoose.Types.ObjectId;
    }
  }
}

// DB related Types
export interface UserInDB extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  googleId?: string;
  profilePicture?: string;
  creationDate: Date;
  firstName?: string;
  lastName?: string;
  address?: {
    street?: string;
    plz?: string;
    city?: string;
  };
  phone?: {
    countryCode?: string;
    number?: number;
  };
  myItems: mongoose.Types.ObjectId[];
  getItems: mongoose.Types.ObjectId[];
  getHistory: mongoose.Types.ObjectId[];
  searchHistory: [{ searchToken: string; date: Date }];
}

export interface ItemInDB extends Document {
  creationDate: Date;
  picture: string | undefined;
  name: string;
  description: string | undefined;
  owner: mongoose.Types.ObjectId;
  interactions: mongoose.Types.ObjectId[];
  available: boolean;
}

export interface ItemInDBPopulated extends Document {
  creationDate: Date;
  picture: string | undefined;
  name: string;
  description: string | undefined;
  owner: mongoose.Types.ObjectId | UserInDB | null;
  interactions: mongoose.Types.ObjectId[] | ItemInteractionInDB[] | null;
  available: boolean;
}

export type PopulatedItemsFromDB =
  | ItemInDBPopulated
  | Array<ItemInDBPopulated>
  | null;

export type InteractionStatuses = 'opened' | 'declined' | 'accepted' | 'closed';
export type InteractingParties = 'getter' | 'giver';

export interface ItemInteractionInDB extends Document {
  creationDate: Date;
  interestedParty: mongoose.Types.ObjectId;
  revealOwnerIdentity: boolean;
  interactionStatus: InteractionStatuses;
  statusChangesLog: {
    newStatus: InteractionStatuses;
    changeInitiator: InteractingParties;
    entryTimestamp: Date;
  }[];
  dueDate: Date;
  messagelog: {
    messageText: string;
    messageWriter: InteractingParties;
    messageTimestamp: Date;
  }[];
}

// Response to Client related Types
export interface ResponseItemForClient {
  _id: mongoose.Types.ObjectId;
  name: string;
  available: boolean;
  picture: string | null;
  description: string | null;
  dueDate: Date | null;
  owner: boolean;
  interactions: mongoose.Types.ObjectId[] | ItemInteractionInDB[] | null;
  commonCommunity: {
    _id: mongoose.Types.ObjectId;
    picture: string;
    name: string;
  } | null;
  ownerData: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
  } | null;
}

// e-mail input from google api
export type GoogleEmailObject = {
  value: string;
  verified: boolean;
};

export type ChangeSettingsRequest = {
  firstName?: string;
  lastName?: string;
  phone?: {
    countryCode: string;
    number: number;
  };
  address?: {
    street: string;
    plz: string;
    city: string;
  };
};
