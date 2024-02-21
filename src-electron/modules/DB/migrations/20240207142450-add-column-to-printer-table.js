import Sequelize from 'sequelize'

module.exports = {
  name: '20240207142450-add-column-to-printer-table',
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('printers',
      'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('printers', 'is_active')
  }
}