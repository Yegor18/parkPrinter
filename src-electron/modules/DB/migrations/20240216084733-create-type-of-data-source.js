import Sequelize from 'sequelize'

module.exports = {
	name: '20240216084733-create-type-of-data-source',
	async up({ context: queryInterface }) {
		await queryInterface.createTable('typesOfDataSources', {
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
		await queryInterface.dropTable('typesOfDataSources');
	}
}