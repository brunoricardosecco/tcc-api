module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'favorites',
      'follower_id',
      'favorite_id',
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'favorites',
      'favorite_id',
      'follower_id',
    );
  },
};
