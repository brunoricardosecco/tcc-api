module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('favorites', 'id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('favorites', 'id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    });
  },
};
