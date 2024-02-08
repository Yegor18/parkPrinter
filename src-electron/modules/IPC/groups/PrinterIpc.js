import { ipcMain } from 'electron'
import { tcpPingPort } from 'tcp-ping-port'
import Printer from '../../DB/models/Printer.js'
import Driver from '../../DB/models/Driver.js'
import { unwrap } from '../../helpers.js'
import equipmentManager from '../../EQUIPMENT/EquipmentManager.js'

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
				CastPrinterRepository.createOrUpdateCastPrinters()
				return 'printer-created-or-updated'
			} else {
				return 'this-printer-already-exists'
			}
		})

		// удаление принтера по id
		ipcMain.handle('delete-printer', async (event, printerId) => {
			await Printer.destroy({ where: { id: printerId } })
			CastPrinterRepository.createOrUpdateCastPrinters()
		})

		// проверка подключения к принтеру
		ipcMain.handle('test-connection', async (event, printerIpAddress) => {
			return await tcpPingPort(printerIpAddress).then((result) => { return result.online })
		})

		// включение принтера
		ipcMain.handle('turn-on-off-printer', async (event, { printerId, operation }) => {
			return new Promise(async (resolve, reject) => {
				let driverModel = equipmentManager.castPrinters.find((castPrinter) => castPrinter.id === printerId).driver.model
				if (operation === 'on') {
					try {
						if (!driverModel.check()) {
							driverModel.start()
							await Printer.update({ is_active: true }, { where: { id: printerId } })
							await equipmentManager.createOrUpdateCastPrinters()
							resolve({ type: 'positive', message: 'Подключение установлено!' })
						} else {
							resolve({ type: 'info', message: 'Подключение уже установлено!' })
						}
					} catch (error) {
						console.log(error)
						reject('Ошибка подключения!')
					}
				} else if (operation === 'off') {
					try {
						if (driverModel.check()) {
							resolve('Отключение от принтера', driverModel.stop())
						}
					} catch(error) {
						console.log(error)
						reject('Ошибка при отключении')
					}
				}
			})
		})
	}
}

export default new PrinterIpc