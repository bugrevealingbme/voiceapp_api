module.exports = (sequelize, DataTypes) => {
  const Accounts = sequelize.define(
    'accounts',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      authorization: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      xuserid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'accounts',
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Accounts;
};
