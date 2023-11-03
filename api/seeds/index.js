if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const {name, picture, itemOwners} = require('./seedHelpers');
const Item = require('../models/item');
// const Review = require("../models/review");
// const Borrowingrequest = require("../models/borrowingrequest");

const dbURL = `${process.env.DB_URL}vimbs-dev`;
// const dbURL = `${process.env.DB_URL}FriendsShelves`;
//mongodb://127.0.0.1:27017/friends-shelves
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  // await Borrowingrequest.deleteMany({});
  // await Review.deleteMany({});
  await Item.deleteMany({});
  // for checking if documents are properly connected:
  // const c = new Book({ title: 'purple field' });
  // await c.save();
  for (let i = 0; i < 20; i++) {
    const item = new Item({
      name: `${sample(name)}`,
      picture: `${sample(picture)}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa nihil nisi sit sapiente, eligendi, vero totam vel sequi asperiores ipsa iusto esse quaerat cumque doloribus delectus amet sint id minus.',
      owner: `${sample(itemOwners)}`,
    });
    await item.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
