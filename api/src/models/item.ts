import mongoose, {Schema, Document} from 'mongoose';
// import ItemInteraction from './itemInteraction';

interface IItem extends Document {
  creationDate: Date;
  picture: string | undefined;
  name: string;
  description: string | undefined;
  owner: mongoose.Types.ObjectId;
  interactions: mongoose.Types.ObjectId[];
  available: boolean;
}

const ItemSchema: Schema = new Schema({
  creationDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  picture: String,
  name: {
    type: String,
    required: true,
  },
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // interactions: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: "ItemInteraction",
  //   },
  // ],
  available: {type: Boolean, default: true},
});

const Item = mongoose.model<IItem>('Item', ItemSchema);

export default Item;
