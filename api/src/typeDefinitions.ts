import mongoose, { Document } from 'mongoose';
import {
  HouseAndGarden,
  ChildAndBaby,
  MediaAndGames,
  AdultClothing,
  SportAndCamping,
  Technology,
  Other,
} from './utils/categoryStringDefinitions';

import {
  itemInteractionStatuses,
  itemInteractionPartakers,
} from './utils/itemInteractionStringDefinitons';

// Extension of Express.User, so that req.user._id can be used
declare global {
  namespace Express {
    interface User {
      _id: mongoose.Types.ObjectId;
    }
  }
}

// export type Categories = (typeof categoriesArray)[number];

export type Categories = {
  HouseAndGarden?: {
    name: string;
    subcategories: Array<HouseAndGarden>;
  };
  ChildAndBaby?: {
    name: string;
    subcategories: Array<ChildAndBaby>;
  };
  MediaAndGames?: {
    name: string;
    subcategories: Array<MediaAndGames>;
  };
  AdultClothing?: {
    name: string;
    subcategories: Array<AdultClothing>;
  };
  SportAndCamping?: {
    name: string;
    subcategories: Array<SportAndCamping>;
  };
  Technology?: {
    name: string;
    subcategories: Array<Technology>;
  };
  Other?: {
    name: string;
    subcategories: Array<Other>;
  };
};

export type CategoriesForInput = {
  HouseAndGarden?: {
    subcategories: Array<HouseAndGarden>;
  };
  ChildAndBaby?: {
    subcategories: Array<ChildAndBaby>;
  };
  MediaAndGames?: {
    subcategories: Array<MediaAndGames>;
  };
  AdultClothing?: {
    subcategories: Array<AdultClothing>;
  };
  SportAndCamping?: {
    subcategories: Array<SportAndCamping>;
  };
  Technology?: {
    subcategories: Array<Technology>;
  };
  Other?: {
    subcategories: Array<Other>;
  };
};

// export type HouseAndGarden = 'Baustellengeräte' | 'Deko' | 'Gartengeräte';
export type HouseAndGarden = (typeof HouseAndGarden)[number];
export type ChildAndBaby = (typeof ChildAndBaby)[number];
export type MediaAndGames = (typeof MediaAndGames)[number];
export type AdultClothing = (typeof AdultClothing)[number];
export type SportAndCamping = (typeof SportAndCamping)[number];
export type Technology = (typeof Technology)[number];
export type Other = (typeof Other)[number];

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
    number?: string;
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
  categories: Categories;
  owner: mongoose.Types.ObjectId;
  interactions: mongoose.Types.ObjectId[];
  available: boolean;
}

export interface ItemInDBPopulated extends Document {
  creationDate: Date;
  picture: string | undefined;
  name: string;
  description: string | undefined;
  categories: Categories;
  owner: mongoose.Types.ObjectId | UserInDB | null;
  interactions: mongoose.Types.ObjectId[] | ItemInteractionInDB[] | null;
  available: boolean;
}

export type PopulatedItemsFromDB =
  | ItemInDBPopulated
  | Array<ItemInDBPopulated>
  | null;

export type InteractionStatuses = (typeof itemInteractionStatuses)[number];
export type InteractingParties = (typeof itemInteractionPartakers)[number];

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
  categories: Categories;
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
    name: string;
    picture: string;
    email: string;
    phone: string;
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
    number: string;
  };
  address?: {
    street: string;
    plz: string;
    city: string;
  };
};

export type ItemRequest = {
  picture?: string;
  name: string;
  description?: string;
  categories: CategoriesForInput;
};

export type ItemInteractionRequest = {
  status: InteractionStatuses;
  message?: string;
  dueDate?: string;
};
