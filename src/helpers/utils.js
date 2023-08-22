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

module.exports = {
    controllerErrorHOF,
}