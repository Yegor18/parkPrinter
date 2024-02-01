'use strict';
/** @type {import('sequelize-cli').Migration} */
import Sequelize from 'sequelize';

module.exports = {
  name: '20240201125821-create-printer',
  async up({ context: queryInterface }) {
    await queryInterface.createTable('Printers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      driver: {
        type: Sequelize.STRING
      },
      ipAddress: {
        type: Sequelize.STRING
      },
      port: {
        type: Sequelize.STRING
      }
    });
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('Printers');
  }
};