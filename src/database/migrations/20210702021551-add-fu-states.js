module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('states', 'fu', { type: Sequelize.STRING });
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('states', 'fu', {});
  },
};
