'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  name: '20240201130409-printers',
  async up ({ context: queryInterface }) {
    await queryInterface.bulkInsert('Printers', [
      {
        name: 'logopack',
        driver: 'logopack',
        ipAddress: '4.4.4.4',
        port: '4444'
      },
      {
        name: 'dikai',
        driver: 'dikai',
        ipAddress: '1.1.1.1',
        port: '1111'
      },
      {
        name: 'windows',
        driver: 'windows',
        ipAddress: '6.6.6.6',
        port: '6666'
      }
    ])
  },

  async down ({ context: queryInterface }) {
    await queryInterface.bulkDelete('Printers', null, {})
  }
};
