const Joi = require('joi');
const { validate } = require('./helper');

const validateAll = validate(
  {
    action: Joi.string().required(),
    timestamp: Joi.number().required(),
  },
  'Validate All Error',
  { ignoreOnDev: true }
);

module.exports = {
  validateAll,
};
