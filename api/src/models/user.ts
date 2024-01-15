// User Model for working with MongoDB

import mongoose, { Schema } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import { UserInDB } from '../typeDefinitions';

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: function (this: UserInDB): boolean {
      // The email is required if googleId is not provided or googleId is an empty string
      return !(this.googleId && this.googleId.trim() !== '');
    },
    unique: function (this: UserInDB): boolean {
      // The email is required if googleId is not provided or googleId is an empty string
      return !(this.googleId && this.googleId.trim() !== '');
    },
  },
  googleId: {
    required: false,
    type: String,
    unique: true,
  },
  profilePicture: {
    required: false,
    type: String,
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  firstName: {
    required: false,
    type: String,
  },
  lastName: {
    required: false,
    type: String,
  },
  phone: {
    countryCode: {
      required: false,
      type: String,
      default: '+49',
    },
    number: String,
  },
  address: {
    street: String,
    plz: String,
    city: String,
  },
  myItems: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },
  ],
  getItems: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },
  ],
  getHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Item',
    },
  ],
  searchHistory: [
    {
      searchToken: String,
      date: Date,
    },
  ],
  giveReviews: [
    {
      interactionId: {
        type: Schema.Types.ObjectId,
        ref: 'ItemInteraction',
      },
      rating: Number,
      body: String,
    },
  ],
  giveReviewStats: {
    count: { type: Number, default: 0 },
    meanRating: { type: Number, default: 0 },
  },
  getReviews: [
    {
      interactionId: {
        type: Schema.Types.ObjectId,
        ref: 'ItemInteraction',
      },
      rating: Number,
      body: String,
    },
  ],
  getReviewStats: {
    count: { type: Number, default: 0 },
    meanRating: { type: Number, default: 0 },
  },
});

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
});

const User = mongoose.model('User', UserSchema);
// const User = mongoose.model<UserInDB>('User', UserSchema);
// when exporting the UserModel with the Type, the passport functions won't run on it any more

export default User;
