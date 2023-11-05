const Item = require('../models/item');
const {processItemForClient} = require('../middleware');

//TODO ER FR : revise search logic
//TODO ER: use response more concious
// fetch all items from DB that don't belog to user and process for client
module.exports.index = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const items = await Item.find({owner: {$ne: currentUser}})
    .populate('owner')
    .populate('interactions')
    .sort({name: 1});
  const response = [];
  processItemForClient(items, currentUser, response);
  res.send(response);
};

// fetch users inventory from DB and process for client
module.exports.myInventory = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const items = await Item.find({owner: currentUser})
    .populate('interactions')
    .sort({title: 1});
  console.log(items[0]);
  const response = [];
  processItemForClient(items, currentUser, response);
  res.send(response);
};

// react version of: post request handeling for a new book
module.exports.createItem = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const item = new Item(req.body.item);
  item.owner = currentUser;
  await item.save();
  const response = [];
  processItemForClient([item], currentUser, response);
  // req.flash('success', 'Successfully created a new book!');
  res.send(response);
};

// Esther to Alex: Also toggle on isLogged in in the routes, once you start using this at the FE
module.exports.showItem = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const item = await Item.findById(req.params.id)
    .populate('owner')
    .populate('interactions');
  //TODO ER: !response as middleware -global
  if (!item)
    // req.flash('error', 'Cannot find that book!');
    return res.send('book not found');
  const response = [];
  processItemForClient([item], currentUser, response);

  return res.send(response);
};
