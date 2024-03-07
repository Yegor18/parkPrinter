module.exports = {
	name: '20240305082658-example-template',
	async up({ context: queryInterface }) {
		await queryInterface.bulkInsert('templates', [
			{
				name: 'Без шаблона',
				template: ''
			},
			{
				name: 'Шаблон 1',
				template: '^XA\n^CFd0,10,18\n^PR12\n^LRY\n^MD30\n^PW350\n^LL150\n^PON\n^FO79,57^FD${foo}^FS^PQ1\n^XZ'
			}
		])
	},
	async down({ context: queryInterface }) {
		await queryInterface.bulkDelete('templates')
	}
}