module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define(
    'Favorite',
    {
      user_id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      favorite_id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
      },
    },
    {
      timestamps: false,
    },
  );

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, {
      as: 'favoriteUser',
      foreignKey: 'favorite_id',
      targetKey: 'id',
    });
    Favorite.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id',
      targetKey: 'id',
    });
  };

  return Favorite;
};
