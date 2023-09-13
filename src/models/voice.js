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
      fake_name: {
        type: DataTypes.STRING,
        allowNull: true,
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
      lang_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'languages',
          key: 'id',
        },
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
