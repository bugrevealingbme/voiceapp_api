require('dotenv').config();
const Sequelize = require('sequelize');

const { DATABASE_URL, NODE_ENV } = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  // dialectOptions: {
  //   ssl: {
  //     rejectUnauthorized: true,
  //     ssl: true,
  //     ca: readFileSync(join(__dirname, certPath)).toString(),
  //   },
  // },
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
    acquire: 30000
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


// #region Import
db.Generated = require('../models/generated')(sequelize, Sequelize);
db.Accounts = require('../models/accounts')(sequelize, Sequelize);
db.Voice = require('../models/voice')(sequelize, Sequelize);
db.VoiceIds = require('../models/voice_ids')(sequelize, Sequelize);
db.Languages = require('../models/languages')(sequelize, Sequelize);

db.Generated.belongsTo(db.Voice, { foreignKey: 'voice_id' });
db.Voice.hasMany(db.Generated, { foreignKey: 'voice_id', sourceKey: 'id' });

db.VoiceIds.belongsTo(db.Voice, { foreignKey: 'voice_id' });
db.Voice.hasMany(db.VoiceIds, { foreignKey: 'voice_id', sourceKey: 'id' });

db.VoiceIds.belongsTo(db.Accounts, { foreignKey: 'account_id' });
db.Accounts.hasMany(db.VoiceIds, { foreignKey: 'account_id', sourceKey: 'id' });

db.Voice.belongsTo(db.Languages, { foreignKey: 'lang_id' });
db.Languages.hasMany(db.Voice, { foreignKey: 'lang_id', sourceKey: 'id' });
// #endregion


// #region Sync Databse
db.syncAll = async () => {
  await Promise.all([
    db.Generated.sync({ force: false }),
    db.Accounts.sync({ force: false }),
    db.Voice.sync({ force: false }),
    db.VoiceIds.sync({ force: false }),
    db.Languages.sync({ force: false }),
  ]);
};
// #endregion

module.exports = db;
