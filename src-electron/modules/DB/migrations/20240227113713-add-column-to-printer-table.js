import Sequelize from 'sequelize'

module.exports = {
	name: '20240227113713-add-column-to-printer-table',
	async up({ context: queryInterface }) {
		await queryInterface.addColumn('printers',
			'config', {
			type: Sequelize.STRING(1000),
			defaultValue: JSON.stringify({})
		})
	},
	async down({ context: queryInterface }) {
		await queryInterface.removeColumn('printers', 'config')
	}
}