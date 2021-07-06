module.exports = {
  up: async (queryInterface) => {
    await queryInterface.renameTable('followers', 'favorites');
  },

  down: async (queryInterface) => {
    await queryInterface.renameTable('favorites', 'followers');
  },
};
