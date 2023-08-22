/* eslint-disable global-require */
require('dotenv').config();


const app = async () => {
  console.log('[NETWORK APP]\tSTARTING');
  const db = require('./lib/database');
  const server = require('./lib/server');

  await db.sequelize.authenticate();
  console.info('[POSTGRESQL]\tSuccessfully connected to the database');
  await db.syncAll();
  console.info('[POSTGRESQL]\tSuccessfully sync to the database');
  await server.initialize();
};

app()
  .then(async () => console.log('[NETWORK APP]\tSTARTED'))
  .catch((err) => {
    console.log('[NETWORK APP]\tNOT STARTED');
    console.error(err);
    process.exit();
  });
