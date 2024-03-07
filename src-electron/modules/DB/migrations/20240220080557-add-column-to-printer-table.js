import Sequelize from 'sequelize'

module.exports = {
	name: '20240220080557-add-column-to-printer-table',
	async up({ context: queryInterface }) {
		await queryInterface.addColumn('printers',
			'data_source_id', {
			type: Sequelize.INTEGER
		})
		await queryInterface.addConstraint('printers', {
			fields: ['data_source_id'],
			type: 'foreign key',
			references: { table: 'dataSources', field: 'id' }
		})
	},
	async down({ context: queryInterface }) {
		await queryInterface.removeColumn('printers', 'data_source_id')
	}
}