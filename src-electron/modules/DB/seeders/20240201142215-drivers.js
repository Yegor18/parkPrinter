module.exports = {
	name: '20240201142215-drivers',
	async up({ context: queryInterface }) {
		await queryInterface.bulkInsert('drivers', [
			{
				name: 'logopack'
			},
			{
				name: 'dikai'
			},
			{
				name: 'windows'
			},
		])
	},
	async down({ context: queryInterface }) {
		await queryInterface.bulkDelete('drivers')
	}
}
