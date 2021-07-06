module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('favorites', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    queryInterface.removeColumn('favorites', 'id', {});
  },
};
