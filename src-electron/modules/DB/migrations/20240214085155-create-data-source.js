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
      type_id: {
        type: Sequelize.INTEGER
      },
      config: {
        type: Sequelize.STRING(1000)
      }
    })
		await queryInterface.addConstraint('dataSources', {
			fields: ['type_id'],
			type: 'foreign key',
      references: { table: 'typesOfDataSources', field: 'id' }
		})
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('dataSources')
  }
}