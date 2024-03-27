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

  //create notifictation contents
  const notification: NotificationInDB = new Notification();

  // set headline according to notificationSituation

  // new opened interaction
  if (notificationSituation === 'interestedPartyOpensInteraction') {
    notification.body.headline = `>${
      interestedParty.firstName ? interestedParty.firstName : noFirstName
    }< ist an >${item.name}< interessiert`;
  }

  // declined interaction
  if (notificationSituation === 'declinigOpenedInteraction') {
    //the interactingParty causes the notification
    if (currentUser.equals(interaction.interestedParty._id)) {
      notification.body.headline = `>${
        interestedParty.firstName ? interestedParty.firstName : noFirstName
      }< hat die Anfrage zu >${item.name}< zurückgezogen`;
    }
    //the owner causes the notification
    else if (currentUser.equals(item!.owner!._id)) {
      notification.body.headline = `>Eigentümer< hat deine Anfrage zu >${item.name}< abgelehnt`;
      // substitiute Eigentümer accordingly
      //! ${
      //!   interaction.revealOwnerIdentity === true ? item.owner.firstName : 'Eigentümer'
      //!   interestedParty.firstName ? interestedParty.firstName : noFirstName
      //! }
    }
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
      notification.body.headline = `Neue Nachricht: >Eigentümer< zu >${item.name}<`;
      // substitiute Eigentümer accordingly
      //! ${
      //!   interaction.revealOwnerIdentity === true ? item.owner.firstName : 'Eigentümer'
      //!   interestedParty.firstName ? interestedParty.firstName : noFirstName
      //! }
    }
  } else {
    new ExpressError('Internal Server Error', 500);
  }

  if (bodyText !== '') notification.body.text = bodyText;
  notification.item = item._id;
  notification.interaction = interaction._id;
  notification.itemPicture = item.picture;

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
