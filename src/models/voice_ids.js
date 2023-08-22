module.exports = (sequelize, DataTypes) => {
  const VoiceIds = sequelize.define(
    'voice_ids',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id',
        },
      },
      voice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'voice',
          key: 'id',
        },
      },
      manifest: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'voice_ids',
      timestamps: false,
      freezeTableName: true,
    }
  );

  return VoiceIds;
};
