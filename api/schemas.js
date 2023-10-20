const Joi = require('joi').extend(require('@joi/date'));;

module.exports.bookSchema = Joi.object({
    book: Joi.object({
        title: Joi.string().required(),
        author: Joi.string().required(),
        image: Joi.string().required(),
        isbn: Joi.string().required(),
        blurb: Joi.string().required(),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required(),
    }).required()
});

module.exports.borrowingrequestSchema = Joi.object({
    borrowingrequest: Joi.object({
        // Esther: ToDo when FE borrwoing logic is up: get rid of requserid
        requserid: Joi.string(),
        status: Joi.string(),
        message: Joi.string(),
        dueDate: Joi.date().format('YYYY-MM-DD'),
    }).required()
});