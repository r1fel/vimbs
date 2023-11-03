const Item = require('../models/item');

//TODO ER FR : revise search logic
//TODO ER: use response more concious
// react version of: send all books that don't belong to the user to FE
module.exports.index = async (req, res) => {
  const currentUser = '6544bbe8df354e46068d74bb';
  // const currentUser = req.user._id;
  const items = await Item.find()
    .populate('owner')
    .populate('interactions')
    .sort({name: 1});
  const response = items.map(
    ({_id, picture, name, description, owner, interactions, available}) => ({
      _id,
      picture: picture ? picture : null,
      name,
      description: description ? description : null,
      available,
      dueDate: '',
      // ['closed', 'declined'].includes(
      //   interactions[interactions.length - 1].interactionStatus
      // )
      //   ? ''
      //   : interactions[interactions.length - 1].dueDate,
      owner: owner.equals(currentUser) ? true : false,
      commonCommunity: owner.equals(currentUser)
        ? ''
        : {
            _id: '6544bbe8dk864e46068d74bb',
            picture:
              'https://tse1.mm.bing.net/th?id=OIP.UUUdgz2gcp7-oBfIHsrEMQHaIn&pid=Api',
            name: 'our common community',
          },
      interaction: '',
      // owner.equals(currentUser)
      //   ? interactions
      //   : interactions[interactions.length - 1],
      ownerData: owner.equals(currentUser)
        ? ''
        : {
            ownerId: owner._id,
            ownerFirstName: owner.username,
          },
    })
  );
  res.send(response);
};
