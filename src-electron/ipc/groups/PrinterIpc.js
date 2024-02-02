import { ipcMain } from 'electron'
import Printer from '../../models/printer'
import Driver from '../../models/driver'
import { unwrap } from '../../modules/helpers'

class PrinterIpc {
  constructor() {
    // получение списка принтеров
    ipcMain.handle('get-printers', async () => {
      return unwrap(await Printer.findAll({ include: { model: Driver } }))
    })
  }
}

export default new PrinterIpc