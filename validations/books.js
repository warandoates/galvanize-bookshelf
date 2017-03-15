const Joi = require('joi');

module.exports.post = {
  body: {
    title: Joi.string()
      .label('Title')
      .required()
      .trim(),

    author: Joi.string()
      .label('Author')
      .required()
      .trim(),

    genre: Joi.string()
      .label('Genre')
      .required()
      .trim(),

    description: Joi.string()
      .label('Description')
      .required()
      .trim(),

    cover_url: Joi.string()
      .label('CoverUrl')
      .required()
      .trim(),
  }
};
