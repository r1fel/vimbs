import {Request, Response, NextFunction} from 'express';
import mongoose from 'mongoose';
import ExpressError from '../utils/ExpressError';
import {Item} from '../models/item';
import {ItemInteraction} from '../models/itemInteraction';
import {
  UserInDB,
  ItemInteractionInDB,
  ResponseItemForClient,
  InteractionStatuses,
  PopulatedItemsFromDB,
} from '../typeDefinitions';
import {processItemForClient} from '../utils/processItemForClient';

// create ItemInteraction
export const createItemInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status: InteractionStatuses = req.body.itemInteraction.status;
  if (status !== 'opened')
    return next(
      new ExpressError('you cant create an interactionwith this request', 500)
    );

  const item: PopulatedItemsFromDB = await Item.findById(req.params.itemId)
    .populate<{owner: UserInDB}>('owner')
    .populate<{interactions: ItemInteractionInDB[]}>('interactions');
  // const item: ItemInDB | null = await Item.findById(req.params.itemId);
  if (item === null)
    return next(new ExpressError('this item doesnt exist', 500));

  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  // if (item.owner.equals(currentUser))
  //   return next(
  //     new ExpressError(
  //       'this is your own item, you cant open an request on it',
  //       500
  //     )
  //   );

  const reqTimestamp = new Date();
  const message: string = req.body.itemInteraction.message;
  const dueDate: Date = req.body.itemInteraction.dueDate;
  const interaction: ItemInteractionInDB = new ItemInteraction();
  interaction.interestedParty = currentUser;
  interaction.interactionStatus = status;
  interaction.dueDate = dueDate;
  interaction.messagelog.push({
    messageText: message,
    messageWriter: 'getter',
    messageTimestamp: reqTimestamp,
  });
  interaction.statusChangesLog.push({
    newStatus: status,
    changeInitiator: 'getter',
    entryTimestamp: reqTimestamp,
  });
  item.available = false;
  if (item.interactions === null) item.interactions = [interaction._id];
  item.interactions.push(interaction._id);
  await interaction.save();
  await item.save();

  const itemForClientProcessing = [item];
  itemForClientProcessing[0].interactions = [interaction];
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(itemForClientProcessing, currentUser, response);
  res.send(response);
};

export const deleteAllItemInteractions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const item: PopulatedItemsFromDB = await Item.findById(req.params.itemId)
    .populate<{owner: UserInDB}>('owner')
    .populate<{interactions: ItemInteractionInDB[]}>('interactions');
  if (item === null)
    return next(new ExpressError('this item doesnt exist', 500));
  if (item.interactions) {
    for (const itemInteractionId of item.interactions) {
      await ItemInteraction.findByIdAndDelete(itemInteractionId);
    }
  }
  item.interactions = [];
  item.available = true;
  await item.save();
  const currentUser: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    '6544bbe8df354e46068d74bb'
  );
  // const currentUser = req.user._id;
  let response: Array<ResponseItemForClient> = [];
  processItemForClient(item, currentUser, response);
  res.send(response);
};
