import {Request, Response, NextFunction} from 'express';
import ExpressError from '../utils/ExpressError';
import {Item} from '../models/item';
import {ItemInteraction} from '../models/itemInteraction';
import {
  ItemInDB,
  ItemInteractionInDB,
  ObjectId,
  // ResponseItemForClient,
  InteractionStatuses,
} from '../typeDefinitions';
// import {processItemForClient} from '../utils/processItemForClient';

// fetch all items from DB that don't belog to user and process for client
export const createItemInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const item: ItemInDB | null = await Item.findById(req.params.itemId);
  if (item === null)
    return next(new ExpressError('this item doesnt exist', 500));
  const currentUser: ObjectId = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const reqTimestamp = new Date();
  const status: InteractionStatuses = req.body.itemInteraction.status;
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
  item.interactions.push(interaction._id);
  await interaction.save();
  await item.save();
  res.send(item);
  // let response: Array<ResponseItemForClient> = [];
  // processItemForClient(items, currentUser, response);
  // res.send(response);
};
