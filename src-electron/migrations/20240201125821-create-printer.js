'use strict';
/** @type {import('sequelize-cli').Migration} */
import Sequelize from 'sequelize';

module.exports = {
  name: '20240201125821-create-printer',
  async up({ context: queryInterface }) {
    await queryInterface.createTable('printers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      driver_id: {
        type: Sequelize.INTEGER
      },
      ipAddress: {
        type: Sequelize.STRING
      },
      port: {
        type: Sequelize.STRING
      }
    });
    await queryInterface.addConstraint('printers', {
      fields: ['driver_id'],
      type: 'foreign key',
      references: { table: 'drivers', field: 'id' }
    });
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('printers');
  }
};