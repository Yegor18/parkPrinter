import { ipcMain } from 'electron'
import ping from 'ping'
import Printer from '../../DB/models/Printer.js'
import Driver from '../../DB/models/Driver.js'
import { unwrap } from '../../helpers.js'

class PrinterIpc {
	constructor() {
		// получение списка принтеров
		ipcMain.handle('get-printers', async () => {
			return unwrap(await Printer.findAll({ include: { model: Driver } }))
		})

		// добавление нового принтера или изменение существующего
		ipcMain.handle('save-or-update-printer', async (event, printer) => {
			let driver_id = unwrap(await Driver.findOne({ where: { name: printer.driver } }).then((driver) => { return driver.id }))
			let existingPrinter = unwrap(await Printer.findOne({ where: { name: printer.name, driver_id: driver_id, ipAddress: printer.ipAddress, port: printer.port } }))
			if (existingPrinter === null) {
				if (printer.id === '') {
					await Printer.create({ name: printer.name, driver_id: driver_id, ipAddress: printer.ipAddress, port: printer.port })
				} else {
					await Printer.update({ name: printer.name, driver_id: driver_id, ipAddress: printer.ipAddress, port: printer.port }, { where: { id: printer.id } })
				}
				return 'printer-created-or-updated'
			} else {
				return 'this-printer-already-exists'
			}

		})

		// удаление принтера по id
		ipcMain.handle('delete-printer', async (event, printerId) => {
			await Printer.destroy({ where: { id: printerId } })
		})

		// проверка подключения к принтеру
		ipcMain.handle('test-connection', async (event, printerIpAddress) => {
			return await ping.promise.probe(printerIpAddress).then((data) => { return data.alive })
		})
	}
}

export default new PrinterIpc