module.exports = (sequelize, DataTypes) => {
  const Voice = sequelize.define(
    'voice',
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
      img: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'voice',
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Voice;
};
