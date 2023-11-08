import mongoose, {Document} from 'mongoose';

// DB related Types
export interface UserInDB extends Document {
  email: string;
  username: string;
}

export interface ItemInDB extends Document {
  creationDate: Date;
  picture: string | undefined;
  name: string;
  description: string | undefined;
  owner: ObjectId;
  interactions: mongoose.Types.ObjectId[] | ItemInteractionInDB[];
  available: boolean;
}
export type DBItems = ItemInDB | Array<ItemInDB>;

export type ObjectId = String | mongoose.Types.ObjectId;

export type InteractionStatuses = 'opened' | 'declined' | 'accepted' | 'closed';
export type InteractingParties = 'getter' | 'giver';

export interface ItemInteractionInDB extends Document {
  creationDate: Date;
  interestedParty: ObjectId;
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
  _id: ObjectId;
  name: string;
  available: boolean;
  picture: string | null;
  description: string | null;
  dueDate: Date | null;
  owner: boolean;
  interactions: null; // add itemInteraction[] |
  commonCommunity: {
    _id: ObjectId;
    picture: string;
    name: string;
  } | null;
  ownerData: {
    _id: ObjectId;
    firstName: string;
  } | null;
}
