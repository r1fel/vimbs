// function that processes the situation to set a notification on the appropriate user

import mongoose from 'mongoose';

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

//String Defintions
import { noFirstName } from './setNotificationStringDefinitions';

const setNotification = async (
  notificationSituation: string,
  currentUser: mongoose.Types.ObjectId,
  item: ItemInDBPopulated,
  interaction: ItemInteractionInDB,
  reqBody:
    | { itemInteractionReview: ItemInteractionReviewRequest }
    | { itemInteraction: ItemInteractionRequest },
) => {
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

  //! if current user is item.owner get interestedParty
  let interestedParty: UserInDB | null = null;
  // if(currentUser.equals(item!.owner!._id)){
  interestedParty = await User.findById(interaction.interestedParty);
  if (interestedParty === null) return;
  new ExpressError('Bad Request: This user does not exist', 400);
  // }

  //! check if needed in every case - have request only, when item.owner is not already UserInDB and then if needed
  let owner: UserInDB | null = null;
  owner = await User.findById(item.owner);
  if (owner === null) return;
  new ExpressError('Bad Request: This user does not exist', 400);

  //create notifictation contents
  const notification: NotificationInDB = new Notification();

  // set general notification details
  if (bodyText !== '') notification.body.text = bodyText;
  notification.item = item._id;
  notification.interaction = interaction._id;
  notification.itemPicture = item.picture;

  // set situation specific headline according to notificationSituation

  // new opened interaction
  if (notificationSituation === 'interestedPartyOpensInteraction') {
    notification.body.headline = `>${
      interestedParty.firstName ? interestedParty.firstName : noFirstName
    }< ist an >${item.name}< interessiert`;
  }

  // declined interaction
  else if (notificationSituation === 'declinigOpenedInteraction') {
    //the interactingParty causes the notification
    if (currentUser.equals(interaction.interestedParty._id)) {
      notification.body.headline = `>${
        interestedParty.firstName ? interestedParty.firstName : noFirstName
      }< hat die Anfrage zu >${item.name}< zurückgezogen`;
    }
    //the owner causes the notification
    else if (currentUser.equals(item!.owner!._id)) {
      notification.body.headline = `Deine Anfrage zu >${item.name}< wurde abgelehnt`;
    }
  }

  // accepting interaction
  else if (notificationSituation === 'acceptingOpenedInteraction') {
    notification.body.headline = `>${
      owner.firstName ? owner.firstName : noFirstName
    }< hat deine Anfrage zu >${item.name}< angenommen`;
  }

  // dueDate changed
  else if (notificationSituation === 'dueDateChange') {
    let dueDate: string | undefined | null = null;
    if ('itemInteraction' in reqBody) {
      dueDate = reqBody.itemInteraction.dueDate
        ? reqBody.itemInteraction.dueDate
        : undefined;
      // console.log('hit dueDate change notification', dueDate);
    }
    notification.body.headline = `Das Abgabedatum von >${item.name}< wurde zu >${dueDate}< geändert`;
    // text was already set above, but for dueDate notifications no text is to be sent
    notification.body.text = undefined;
  }

  //new Message
  else if (notificationSituation === 'newMessage') {
    //the interactingParty causes the notification
    if (currentUser.equals(interaction.interestedParty._id)) {
      notification.body.headline = `Neue Nachricht: >${
        interestedParty.firstName ? interestedParty.firstName : noFirstName
      }< zu >${item.name}<`;
    }
    //the owner causes the notification
    else if (currentUser.equals(item!.owner!._id)) {
      notification.body.headline = `Neue Nachricht zu >${item.name}<`;
    }
  } else {
    new ExpressError('Internal Server Error', 500);
  }

  await notification.save();

  // notify user with just created notification

  //the owner gets notified, cause the currentUser is the interactingParty
  if (currentUser.equals(interaction.interestedParty._id)) {
    await User.updateOne(
      { _id: item!.owner!._id },
      { $addToSet: { 'notifications.unread': notification } },
    );
  }
  //the interactingParty gets notified, cause the currentUser is the owner
  else if (currentUser.equals(item!.owner!._id)) {
    await User.updateOne(
      { _id: interaction.interestedParty._id },
      { $addToSet: { 'notifications.unread': notification } },
    );
  }

  //! some dummy return
  return notificationSituation;
};

export default setNotification;
