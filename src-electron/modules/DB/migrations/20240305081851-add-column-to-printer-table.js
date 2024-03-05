import Sequelize from 'sequelize'

module.exports = {
  name: '20240305081851-add-column-to-printer-table',
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('printers',
      'template_id', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    })
    await queryInterface.addConstraint('printers', {
      fields: ['template_id'],
      type: 'foreign key',
      references: { table: 'templates', field: 'id' }
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('printers', 'template_id')
  }
}