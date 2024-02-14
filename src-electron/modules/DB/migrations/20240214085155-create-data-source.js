import Sequelize from 'sequelize'

module.exports = {
  name: '20240214085155-create-data-source',
  async up({ context: queryInterface }) {
    await queryInterface.createTable('dataSources', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      config: {
        type: Sequelize.STRING
      }
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('dataSources')
  }
}