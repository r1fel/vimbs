const mongoose = require('mongoose');
const Review = require('./review');
const Borrowingrequest = require('./borrowingrequest');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: String,
    author: String,
    isbn: String,
    image: String,
    blurb: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],
    borrowingrequests: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Borrowingrequest',
        }
    ]
});

// delete the reviews in the reviews database when a book is deleted
BookSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

// delete the borrowingrequests in the borrowingrequests database when a book is deleted
BookSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Borrowingrequest.deleteMany({
            _id: {
                $in: doc.borrowingrequests
            }
        })
    }
});


module.exports = mongoose.model('Book', BookSchema);