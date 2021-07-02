module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'states',
      [
        { id: 1, name: 'Acre', fu: 'AC' },
        { id: 2, name: 'Alagoas', fu: 'AL' },
        { id: 3, name: 'Amazonas', fu: 'AM' },
        { id: 4, name: 'Amapá', fu: 'AP' },
        { id: 5, name: 'Bahia', fu: 'BA' },
        { id: 6, name: 'Ceará', fu: 'CE' },
        { id: 7, name: 'Distrito Federal', fu: 'DF' },
        { id: 8, name: 'Espírito Santo', fu: 'ES' },
        { id: 9, name: 'Goiás', fu: 'GO' },
        { id: 10, name: 'Maranhão', fu: 'MA' },
        { id: 11, name: 'Minas Gerais', fu: 'MG' },
        { id: 12, name: 'Mato Grosso do Sul', fu: 'MS' },
        { id: 13, name: 'Mato Grosso', fu: 'MT' },
        { id: 14, name: 'Pará', fu: 'PA' },
        { id: 15, name: 'Paraíba', fu: 'PB' },
        { id: 16, name: 'Pernambuco', fu: 'PE' },
        { id: 17, name: 'Piauí', fu: 'PI' },
        { id: 18, name: 'Paraná', fu: 'PR' },
        { id: 19, name: 'Rio de Janeiro', fu: 'RJ' },
        { id: 20, name: 'Rio Grande do Norte', fu: 'RN' },
        { id: 21, name: 'Rondônia', fu: 'RO' },
        { id: 22, name: 'Roraima', fu: 'RR' },
        { id: 23, name: 'Rio Grande do Sul', fu: 'RS' },
        { id: 24, name: 'Santa Catarina', fu: 'SC' },
        { id: 25, name: 'Sergipe', fu: 'SE' },
        { id: 26, name: 'São Paulo', fu: 'SP' },
        { id: 27, name: 'Tocantins', fu: 'TO' },
      ],
      {},
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('states', null, {});
  },
};
