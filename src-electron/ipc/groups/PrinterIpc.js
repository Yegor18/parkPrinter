import { ipcMain } from 'electron'
import Printer from '../../models/Printer'
import Driver from '../../models/Driver'
import { unwrap } from '../../modules/helpers'

class PrinterIpc {
  constructor() {
    // получение списка принтеров
    ipcMain.handle('get-printers', async () => {
      return unwrap(await Printer.findAll({ include: { model: Driver } }))
    })

    // добавление нового принтера
    ipcMain.handle('save-printer', async (event, newPrinter) => {
      let driver_id = unwrap(await Driver.findOne({ where: { name: newPrinter.driver } }).then((driver) => { return driver.id }))
      await Printer.create({
        name: newPrinter.name,
        driver_id: driver_id,
        ipAddress: newPrinter.ipAddress,
        port: newPrinter.port
      })
    })
  }
}

export default new PrinterIpc