const mongoose = require("mongoose");
// const Review = require('./review');
const ItemInteraction = require("./itemInteraction");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
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
    ref: "User",
    required: true,
  },
  interactions: [
    {
      type: Schema.Types.ObjectId,
      ref: "ItemInteraction",
    },
  ],
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model("Item", ItemSchema);
