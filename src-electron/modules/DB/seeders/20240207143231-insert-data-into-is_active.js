// не знаю как сделать миграцию на заполнение нового столбца
module.exports = {
  name: '20240207143231-insert-data-into-is_active',
  async up({ context: queryInterface }) {
    await queryInterface.bulkCreate('printers', [{ is_active: true },{ is_active: true },{ is_active: true }])
  }
}
