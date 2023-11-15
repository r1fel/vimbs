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
  const response = [];
  processItemForClient(items, currentUser, response);
  res.send(response);
};

// create new item
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

// get item by itemId
module.exports.showItem = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const item = await Item.findById(req.params.itemId)
    .populate('owner')
    .populate('interactions');
  //TODO ER: !response as middleware -global
  if (!item)
    // req.flash('error', 'Cannot find that book!');
    return res.send('item not found');
  const response = [];
  processItemForClient([item], currentUser, response);

  return res.send(response);
};

// edit item by itemId
module.exports.updateItem = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  await Item.findByIdAndUpdate(req.params.itemId, {...req.body.item});
  const item = await Item.findById(req.params.itemId)
    .populate('owner')
    .populate('interactions');
  //TODO ER: !response as middleware -global
  if (!item)
    // req.flash('error', 'Cannot find that book!');
    return res.send('item not found');
  const response = [];
  processItemForClient([item], currentUser, response);

  return res.send(response);
};

// search items by search term, fetch from DB that don't belog to user and process for client
module.exports.itemSearch = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const items = await Item.find({name: req.query.q})
    .populate('owner')
    .populate('interactions')
    // sorts own items to beginning or array
    .sort({owner: 1, name: 1});
  const response = [];
  processItemForClient(items, currentUser, response);
  res.send(response);
};
