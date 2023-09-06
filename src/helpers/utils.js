const crypto = require('crypto');


/* eslint-disable no-bitwise */
const controllerErrorHOF = (f) => async (req, res) => {
    try {
        await f(req, res);
    } catch (err) {
        const { message: errorMessage } = err;
        if (process.env.NODE_ENV === 'development') {
            console.error(err);
        } else {
            console.log(errorMessage);
        }

        return res.status(500).send({ message: errorMessage });
    }
};

function generateRandomFileName(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

module.exports = {
    controllerErrorHOF,
    generateRandomFileName,
}