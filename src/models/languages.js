module.exports = (sequelize, DataTypes) => {
  const Languages = sequelize.define(
    'languages',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flag: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'languages',
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Languages;
};
