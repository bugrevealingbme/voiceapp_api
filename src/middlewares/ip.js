const ipMiddleware = (req, res, next) => {
  req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  next();
};

module.exports = {
  ipMiddleware,
};
