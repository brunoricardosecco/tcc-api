module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('favorites', {
      fields: ['user_id', 'favorite_id'],
      type: 'primary key',
      name: 'favorite_pk_fk',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('favorites', 'favorite_pk_fk');
  },
};
