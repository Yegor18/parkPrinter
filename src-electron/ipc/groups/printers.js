import { ipcMain } from 'electron'
import Printer from '../../models/printer.js'
import Driver from '../../models/driver.js'
import { unwrap } from '../../modules/helpers.js'

class PrinterIpc {
	constructor() {
		// получение списка принтеров
		ipcMain.handle('get-printers', async () => {
			return unwrap(await Printer.findAll({ include: { model: Driver } }))
		})
	}
}

export default new PrinterIpc