// Notification Model for working with MongoDB

import mongoose, { Schema } from 'mongoose';
import User from './user';
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

// clean up after notification was deleted
notificationSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // console.log(doc);
    const notificationId = doc._id;

    try {
      //find the user
      const user = await User.findOne({
        $or: [
          { 'notifications.read': notificationId },
          { 'notifications.unread': notificationId },
        ],
      });

      if (user) {
        // If user is found, proceed to update
        await User.updateOne(
          { _id: user._id },
          {
            $pull: {
              'notifications.read': notificationId,
              'notifications.unread': notificationId,
            },
          },
        );
        // console.log(
        //   `Notification ${notificationId} removed from user ${user._id}`,
        // );
      }
    } catch (error) {
      console.error(`Error removing notification ${notificationId}:`, error);
    }
  }
});

const Notification = mongoose.model<NotificationInDB>(
  'Notification',
  notificationSchema,
);

export default Notification;
