import Sequelize from 'sequelize'

module.exports = {
  name: '20240201142153-create-driver',
  async up({ context: queryInterface }) {
    await queryInterface.createTable('drivers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      }
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('drivers')
  }
}