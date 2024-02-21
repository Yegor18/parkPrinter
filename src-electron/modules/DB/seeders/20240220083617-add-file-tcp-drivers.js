module.exports = {
  name: '20240220083617-add-file-tcp-drivers',
  async up ({ context: queryInterface }) {
    await queryInterface.bulkInsert('drivers', [
      {
        name: 'Файловый принтер'
      },
      {
        name: 'Сквозной TCP принтер'
      }
    ])
  },
  async down ({ context: queryInterface }) {
    await queryInterface.bulkDelete('drivers')
  }
}
