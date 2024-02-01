'use strict'
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  name: '20240201142215-drivers',
  async up ({ context: queryInterface }) {
    await queryInterface.bulkInsert('Drivers', [
      {
        name: 'logopack'
      },
      {
        name: 'dikai'
      },
      {
        name: 'windows'
      },
    ])
  },
  async down ({ context: queryInterface }) {
    await queryInterface.bulkDelete('Drivers', null, {})
  }
}
