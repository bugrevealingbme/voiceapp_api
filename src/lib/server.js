require('dotenv').config();

const { urlencoded, json } = require('body-parser');
const { createServer } = require('http');
const WebSocket = require('ws');

// const { join } = require('path');
// const fileUpload = require('express-fileupload');

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const { SERVER_PORT, NODE_ENV } = process.env;

const apiv1 = require('../routes/v1');
const apib1 = require('../routes/b1');
const apim1 = require('../routes/m1');

const whitelist = ['ws://localhost:4102', 'http://localhost:3000', 'http://localhost:4102', 'http://localhost:8080'];

const corsOptions = {
  origin(origin, callback) {
    if (NODE_ENV === 'production' || (NODE_ENV === 'development' && !origin)) {
      return callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200,
};

const API_B1 = '/b1';
const API_V1 = '/v1';
const API_M1 = '/m1';

const initialize = () => {
  const app = express();
  app.disable('x-powered-by');
  app.enable('trust proxy');
  app.use(helmet());
  app.use(cors());
  app.use(morgan(':response-time ms - :remote-addr :method :url :status'));
  app.use(urlencoded({ extended: true }));
  app.use(json({ limit: '10mb', type: 'application/json' }));
  // app.use(
  //   fileUpload({
  //     useTempFiles: true,
  //     tempFileDir: join(__dirname, '../tmp/'),
  //   })
  // );
  app.use(API_V1, apiv1);
  app.use(API_B1, apib1);
  app.use(API_M1, apim1);
  app.use((err, req, res, next) => {
    if (err) {
      console.log(`[EXPRESS CORS ERROR] ${err}`);
      return res.sendStatus(500);
    }
    res.on('finish', () => {
      console.log(`request for ${req.url} finished with status ${res.statusCode}`);
    });
    next();
  });
  app.use((req, res, next) => {
    // listen for when the request is done
    res.on('finish', () => {
      console.log(`request for ${req.url} finished with status ${res.statusCode}`);
    });
    next();
  });

  const server = createServer(app);

  return new Promise((resolve) => {
    server.listen(SERVER_PORT, () => {
      console.info(`[EXPRESS]\tSuccessfully opened on port ${SERVER_PORT}`);
      resolve();
    });
  });
};

module.exports = { initialize };
