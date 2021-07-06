module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define(
    'City',
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
      state_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    },
  );

  City.associate = (models) => {
    City.belongsTo(models.User, {
      as: 'city',
      foreignKey: 'city_id',
      targetKey: 'id',
    });
  };

  return City;
};
