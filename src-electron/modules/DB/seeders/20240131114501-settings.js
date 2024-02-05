module.exports = {
  name: '20240131114501-settings',
  async up({ context: queryInterface }) {
    await queryInterface.bulkInsert('settings', [
      {
        name: 'Настройка 1',
        value: '1234'
      },
      {
        name: 'Настройка 2',
        value: 'sdvds'
      },
      {
        name: 'Настройка 3',
        value: '123e'
      },
      {
        name: 'Настройка 4',
        value: 'true'
      }
    ])
  },
  async down({ context: queryInterface }) {
    await queryInterface.bulkDelete('settings')
  }
}
