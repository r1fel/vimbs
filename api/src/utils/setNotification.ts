// function that processes the situation to set a notification on the appropriate user

// utils
import ExpressError from '../utils/ExpressError';

// models
import Notification from '../models/notification';
import User from '../models/user';

// Type-Definitions
import {
  ItemInteractionInDB,
  ItemInteractionReviewRequest,
  ItemInteractionRequest,
  ItemInDBPopulated,
  NotificationInDB,
  UserInDB,
} from '../typeDefinitions';

const setNotification = async (
  notificationSituation: string,
  item: ItemInDBPopulated,
  interaction: ItemInteractionInDB,
  reqBody:
    | { itemInteractionReview: ItemInteractionReviewRequest }
    | { itemInteraction: ItemInteractionRequest },
) => {
  console.log('notificationSituation', notificationSituation);

  // set the notification bodyText, if body was sent in request
  let bodyText = '';
  if ('itemInteraction' in reqBody) {
    bodyText = reqBody.itemInteraction.message
      ? reqBody.itemInteraction.message
      : '';
    // console.log('reqBody.itemInteraction', reqBody.itemInteraction);
  }
  if ('itemInteractionReview' in reqBody) {
    bodyText = reqBody.itemInteractionReview.body
      ? reqBody.itemInteractionReview.body
      : '';
    // console.log('reqBody.itemInteractionReview', reqBody.itemInteractionReview);
  }

  // get interestedParty
  const interestedParty: UserInDB | null = await User.findById(
    interaction.interestedParty,
  );
  if (interestedParty === null) return;
  new ExpressError('Bad Request: This item does not exist', 400);

  //create notifictation contents
  const notification: NotificationInDB = new Notification();
  notification.body.headline = `>${
    interestedParty.firstName ? interestedParty.firstName : 'Jemand'
  }< ist an >${item.name}< interessiert`;
  if (bodyText !== '') notification.body.text = bodyText;
  notification.item = item._id;
  notification.interaction = interaction._id;
  notification.itemPicture = item.picture;

  await notification.save();

  // notify user with just created notification
  await User.updateOne(
    { _id: item!.owner!._id },
    { $addToSet: { 'notifications.unread': notification } },
  );

  //! some dummy return
  return notificationSituation;
};

export default setNotification;
