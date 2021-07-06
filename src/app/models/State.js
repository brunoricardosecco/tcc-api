module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define(
    'State',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fu: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );

  State.associate = (models) => {
    State.hasMany(models.City, {
      as: 'state',
      foreignKey: 'state_id',
      targetKey: 'id',
    });
  };

  return State;
};
