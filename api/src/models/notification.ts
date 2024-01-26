// Notification Model for working with MongoDB

import mongoose, { Schema } from 'mongoose';
import { NotificationInDB } from '../typeDefinitions';

const notificationSchema: Schema = new Schema({
  timeStamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  emailRequired: {
    type: Boolean,
    default: false,
    required: true,
  },
  body: { headline: { type: String, required: true }, text: String },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  itemPicture: String,
  read: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const Notification = mongoose.model<NotificationInDB>(
  'Notification',
  notificationSchema,
);

export default Notification;
