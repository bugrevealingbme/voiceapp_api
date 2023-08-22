const Joi = require('joi');
const { validate } = require('./helper');

const validateAddBackOfficeUser = validate(
  {
    username: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    password: Joi.string().required(),
  },
  'Validate Add Back Office User Error'
);

const validateLoginBackOfficeUser = validate(
  {
    username: Joi.string().required(),
    password: Joi.string().required(),
  },
  'Validate Login Back Office User Error'
);

module.exports = {
  validateAddBackOfficeUser,
  validateLoginBackOfficeUser,
};
