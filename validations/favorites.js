const joi = require('joi');

module.exports.post = {
  body: {
    bookId: joi.number()
    .integer()
    .label('bookId')
    .required()
    .min(0)
  }
}
