module.exports = {
	name: '20240216090424-types-of-data-sources',
  async up ({ context: queryInterface }) {
		await queryInterface.bulkInsert('typesOfDataSources', [
			{
        name: 'CSV'
      },
      {
        name: 'XLS'
      },
      {
        name: 'API Endpoint'
      },
      {
        name: 'TCP (Данные)'
      },
      {
        name: 'TCP (Сквозной)'
      }
		])
  },
  async down ({ context: queryInterface }) {
    await queryInterface.bulkDelete('typesOfDataSources')
  }
}
