module.exports = (sequelize, DataTypes) => {
  const Generated = sequelize.define(
    'generated',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      voice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'voice',
          key: 'id',
        },
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'generated',
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Generated;
};
