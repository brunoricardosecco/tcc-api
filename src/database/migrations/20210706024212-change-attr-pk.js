module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('favorites', 'user_id', {
      primaryKey: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    });
    await queryInterface.changeColumn('favorites', 'favorite_id', {
      primaryKey: true,
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('favorites', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    });
    await queryInterface.changeColumn('favorites', 'favorite_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    });
  },
};
