// end of line functions when hitting itemInteraction Routes

import { Request, Response, NextFunction } from 'express';

// utils
import ExpressError from '../utils/ExpressError';
import catchAsync from '../utils/catchAsync';
import processItemForClient from '../utils/processItemForClient';
import getFutureDate from '../utils/getFutureDate';

// models
import Item from '../models/item';
import User from '../models/user';
import ItemInteraction from '../models/itemInteraction';

// Type-Definitions
import {
  UserInDB,
  ItemInDB,
  ItemInteractionInDB,
  ResponseItemForClient,
  InteractionStatuses,
  PopulatedItemsFromDB,
  ItemInteractionRequest,
} from '../typeDefinitions';

// string definitions
import {
  itemInteractionPartakers,
  itemInteractionStatuses,
} from '../utils/itemInteractionStringDefinitons';

// create ItemInteraction
export const createItemInteraction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const itemInteractionBody: ItemInteractionRequest =
      req.body.itemInteraction;
    // set constants
    const status = itemInteractionBody.status;
    if (status !== 'opened')
      return next(
        new ExpressError(
          'Bad Request: You cant create an interaction with this request',
          400,
        ),
      );
    // TODO ER: could be done with res.locals.item, but that one is not populated,
    // so I would need to populate by hand and guess this is easier, but needs more traffic
    const item: PopulatedItemsFromDB = await Item.findById(req.params.itemId)
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions');
    if (item === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );

    if (req.user === undefined)
      return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;

    const reqTimestamp = new Date();
    const message: string = itemInteractionBody.message
      ? itemInteractionBody.message
      : '';

    const dueDate: Date =
      itemInteractionBody.dueDate &&
      new Date(itemInteractionBody.dueDate) >= reqTimestamp
        ? new Date(itemInteractionBody.dueDate)
        : getFutureDate(2);
    // const dueDate: Date = new Date(req.body.itemInteraction.dueDate);
    // if (dueDate <= reqTimestamp) return next(new ExpressError('Bad Request: The dueDate must lie in the future', 400));
    //   // dueDate = getFutureDate(2); // sets dueDate to be in 2 weeks in case the due Date was set in the past by the req.user

    const interactingParty = itemInteractionPartakers[0];

    // open new interaction and set req body on interaction
    const interaction: ItemInteractionInDB = new ItemInteraction();
    interaction.interestedParty = currentUser;
    interaction.interactionStatus = status;
    interaction.dueDate = dueDate;
    if (message)
      interaction.messagelog.push({
        messageText: message,
        messageWriter: interactingParty,
        messageTimestamp: reqTimestamp,
      });
    interaction.statusChangesLog.push({
      newStatus: status,
      changeInitiator: interactingParty,
      entryTimestamp: reqTimestamp,
    });
    item.available = false;
    if (item.interactions === null) item.interactions = [interaction._id];
    item.interactions.push(interaction._id);
    await interaction.save();
    await item.save();

    // add item._id to user.getItems
    const user: UserInDB | null = await User.findById(currentUser);
    if (user === null)
      return next(new ExpressError('this user doesnt exist', 500));
    if (!user.getItems.includes(item._id)) {
      user.getItems.push(item._id);
      await user.save();
    }
    // TODO ER: implement notification on item Owner

    // process item for client with the current interaction
    const itemForClientProcessing = [item];
    itemForClientProcessing[0].interactions = [interaction];
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(itemForClientProcessing, currentUser, response);
    res.send(response);
  },
);

// development function to delete all itemInteractions off one item
export const deleteAllItemInteractions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const item: PopulatedItemsFromDB = await Item.findById(req.params.itemId)
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions');
    if (item === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );
    if (item.interactions) {
      for (const itemInteraction of item.interactions) {
        await ItemInteraction.findByIdAndDelete(itemInteraction._id);
      }
    }
    item.interactions = [];
    item.available = true;
    await item.save();
    if (req.user === undefined)
      return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(item, currentUser, response);
    res.send(response);
  },
);

// development function to delete one itemInteraction
export const deleteItemInteraction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // get item and pull interaction from interactions array
    const item: PopulatedItemsFromDB = await Item.findByIdAndUpdate(
      req.params.itemId,
      { $pull: { interactions: req.params.interactionId } },
      { new: true },
    )
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions');
    if (item === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );
    // delete interaction
    await ItemInteraction.findByIdAndDelete(req.params.interactionId);

    // TODO remove isItemAvailable middleware and allow deletion of opened interactions
    // TODO remove item from getItems of interestedParty and change available bools
    // item.available = true;
    // await item.save();
    if (req.user === undefined)
      return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;
    let response: Array<ResponseItemForClient> = [];
    processItemForClient(item, currentUser, response);
    res.send(response);
  },
);

// test function only needed for the scope of coding the itemInteractions
export const dummyController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const status: InteractionStatuses = req.body.itemInteraction.status;
    console.log(status);
    res.send('you passed dummy controller');
  },
);

// controller, that handles the core logic arround itemInteractions
//! in progress
export const handlePostInteraction = catchAsync(
  //constant definitions
  async (req: Request, res: Response, next: NextFunction) => {
    const reqTimestamp = new Date();
    const { itemId, interactionId } = req.params;
    const itemInteractionBody: ItemInteractionRequest =
      req.body.itemInteraction;

    const giver = itemInteractionPartakers[1];
    const getter = itemInteractionPartakers[0];
    const opened = itemInteractionStatuses[0];
    const declined = itemInteractionStatuses[1];
    const accepted = itemInteractionStatuses[2];
    const closed = itemInteractionStatuses[3];
    if (req.user === undefined)
      return next(new ExpressError('Unauthorized', 401));
    const currentUser = req.user._id;

    const item: ItemInDB | null = await Item.findById(itemId);
    if (item === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );

    const interaction: ItemInteractionInDB | null =
      await ItemInteraction.findById(interactionId);
    if (interaction === null)
      return next(
        new ExpressError('Bad Request: This interaction does not exist', 400),
      );

    const pushMessage = () => {
      if (itemInteractionBody.message) {
        interaction.messagelog.push({
          messageText: itemInteractionBody.message,
          messageWriter: item.owner.equals(currentUser) ? giver : getter,
          messageTimestamp: reqTimestamp,
        });
      }
    };
    const changeInteractionStatus = () => {
      interaction.interactionStatus = itemInteractionBody.status;
      interaction.statusChangesLog.push({
        newStatus: itemInteractionBody.status,
        changeInitiator: item.owner.equals(currentUser) ? giver : getter,
        entryTimestamp: reqTimestamp,
      });
    };

    const setDueDate = (time?: number) => {
      let dueDate: Date;
      // if in setDueDate a time is supplied, the dueDate is set to the time supplied
      if (time !== undefined) {
        dueDate = getFutureDate(time);
        return (interaction.dueDate = dueDate);
      }

      // if setDueDate is called without argument, the given dueDate is used
      // if no dueDate was given, the dueDate stays the same as already saved on the interaction
      dueDate =
        itemInteractionBody.dueDate &&
        new Date(itemInteractionBody.dueDate) >= reqTimestamp
          ? new Date(itemInteractionBody.dueDate)
          : interaction.dueDate;
      return (interaction.dueDate = dueDate);
    };

    const toggleAvailability = () => {
      item.available = !item.available;
    };

    const revealOwnerIdentity = () => {
      interaction.revealOwnerIdentity = true;
    };

    // the if cascade logic:
    // users are messaging
    if (interaction.interactionStatus === itemInteractionBody.status) {
      pushMessage();
      // owner can also adjust the due Date in accepted state
      if (
        interaction.interactionStatus === accepted &&
        currentUser.equals(item.owner)
      )
        setDueDate();
    }

    // declining the opened interaction
    else if (
      interaction.interactionStatus === opened &&
      itemInteractionBody.status === declined
    ) {
      // console.log('opened to declined');
      changeInteractionStatus();
      setDueDate(0); //to now
      toggleAvailability();
      pushMessage();
      await User.updateOne(
        { _id: interaction.interestedParty },
        { $pull: { getItems: itemId }, $push: { getHistory: itemId } },
      );
    }

    // owner accepts interaction
    else if (
      interaction.interactionStatus === opened &&
      itemInteractionBody.status === accepted &&
      currentUser.equals(item.owner)
    ) {
      // console.log('owner accepted');
      changeInteractionStatus();
      setDueDate();
      pushMessage();
      revealOwnerIdentity();
    }

    // owner closes interaction
    else if (
      interaction.interactionStatus === accepted &&
      itemInteractionBody.status === closed &&
      currentUser.equals(item.owner)
    ) {
      // console.log('owner closed');
      changeInteractionStatus();
      toggleAvailability();
      pushMessage();
      await User.updateOne(
        { _id: interaction.interestedParty },
        { $pull: { getItems: itemId }, $addToSet: { getHistory: itemId } },
      );
    }

    // for all other combinations
    else {
      return next(
        new ExpressError(
          'Bad Request: The requested change on the interaction is not allowed',
          400,
        ),
      );
    }

    // save the changes made in the if cascade
    await interaction.save();
    await item.save();

    const updatedItem: PopulatedItemsFromDB = await Item.findById(
      req.params.itemId,
    )
      .populate<{ owner: UserInDB }>('owner')
      .populate<{ interactions: ItemInteractionInDB[] }>('interactions');
    if (updatedItem === null)
      return next(
        new ExpressError('Bad Request: This item does not exist', 400),
      );

    let response: Array<ResponseItemForClient> = [];
    processItemForClient(updatedItem, currentUser, response);
    res.send(response);
    // res.send(`Item: ${item} Interaction: ${interaction}`);
  },
);
