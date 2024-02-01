'use strict'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  name: '20240201130409-printers',
  async up ({ context: queryInterface }) {
    await queryInterface.bulkInsert('Printers', [
      {
        name: 'logopack',
        driver: 1,
        ipAddress: '4.4.4.4',
        port: '4444'
      },
      {
        name: 'dikai',
        driver: 2,
        ipAddress: '1.1.1.1',
        port: '1111'
      },
      {
        name: 'windows',
        driver: 3,
        ipAddress: '6.6.6.6',
        port: '6666'
      }
    ])
  },
  async down ({ context: queryInterface }) {
    await queryInterface.bulkDelete('Printers', null, {})
  }
}
