const Joi = require('joi');

const { NODE_ENV } = process.env;


const getBody = (req, res, next) => {
  if (NODE_ENV === 'development') {
    return next();
  }

  const { action } = req.body;
  req.body = JSON.parse(action);

  return next();

};

const validate = (validateObject, errorMessage, options) => (req, res, next) => {
  if (options && options.ignoreOnDev && NODE_ENV === 'development') {
    return next();
  }

  const { error } = Joi.object().keys(validateObject).validate(req.body);
  if (error) {
    const { message } = error;
    console.log(`[${errorMessage}]: ${message}`);

    return res.status(400).send({ message });
  }

  return next();
};

const modelMiddlewareHOF = (f) => async (req, res, next) => {
  try {
    await f(req, res, next);
  } catch (error) {
    const { message: errorMessage } = error;
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    } else {
      console.log(errorMessage);
    }

    return res.status(500).send({ message: errorMessage });
  }
};


module.exports = {
  modelMiddlewareHOF,
  getBody,
  validate,
};
