import Sequelize from 'sequelize'

module.exports = {
  name: '20240305075813-create-template',
  async up({ context: queryInterface }) {
    await queryInterface.createTable('templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      template: {
        type: Sequelize.STRING(5000)
      }
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('templates')
  }
}