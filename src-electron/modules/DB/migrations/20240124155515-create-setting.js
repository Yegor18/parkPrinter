import Sequelize from 'sequelize'

module.exports = {
	name: '20240124155515-create-setting',
	async up({ context: queryInterface }) {
		await queryInterface.createTable('settings', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.STRING
			},
			value: {
				type: Sequelize.STRING
			}
		})
	},
	async down({ context: queryInterface }) {
		await queryInterface.dropTable('settings')
	}
}