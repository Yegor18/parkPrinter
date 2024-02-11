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
				let newPrinter = { name: printer.name, driver_id: driver_id, ipAddress: printer.ipAddress, port: printer.port, is_active: false }
				if (printer.id === '') {
					await Printer.create(newPrinter).then(async () => {
						let printerId = unwrap(await Printer.max('id'))
						equipmentManager.addCastPrinter(printerId, printer.driver, newPrinter)
					})
				} else {
					await Printer.update(newPrinter, { where: { id: printer.id } }).then(() => {
						equipmentManager.updateCastPrinter(printer.id, printer.driver, newPrinter.ipAddress, newPrinter.port)
					})
				}
				return 'printer-created-or-updated'
			} else {
				return 'this-printer-already-exists'
			}
		})

		// удаление принтера по id
		ipcMain.handle('delete-printer', async (event, printerId) => {
			await Printer.destroy({ where: { id: printerId } }).then(() => {
				equipmentManager.deleteCastPrinter(printerId)
			})
		})

		// проверка подключения к принтеру
		ipcMain.handle('test-connection', async (event, printerIpAddress) => {
			return await tcpPingPort(printerIpAddress).then((result) => { return result.online })
		})

		// включение и отключение принтера
		ipcMain.handle('turn-on-off-printer', async (event, { printerId, operation }) => {
			let driverModel = equipmentManager.castPrinters.find((castPrinter) => castPrinter.id === printerId).driver
			if (operation === 'on') {
				if (!driverModel.check()) {
					let isStarted = await driverModel.start().then((result) => { return result })
					if (isStarted) {
						await Printer.update({ is_active: true }, { where: { id: printerId } })
						equipmentManager.castPrinters.find((castPrinter) => castPrinter.id === printerId).isActive = true
						return { type: 'ok-on', message: 'Подключение установлено!' }
					} else {
						return { type: 'error-on', message: 'Не удалось подключиться!' }
					}
				}
			} else if (operation === 'off') {
				if (driverModel.check()) {
					if (driverModel.stop()) {
						await Printer.update({ is_active: false }, { where: { id: printerId } })
						equipmentManager.castPrinters.find((castPrinter) => castPrinter.id === printerId).isActive = false
						return { type: 'ok-off', message: 'Отключение выполнить удалось!' }
					}
				}
			}
		})

		// проверка подключения при старте и по таймеру
		ipcMain.handle('get-failed-connections-to-printers', (evet, rule) => {
			let message = ''
			if (rule === 'atStart') {
				if (equipmentManager.failedConnections.length !== 0) {
					message = 'Не удалось подключиться к следующим адресам: ' + equipmentManager.failedConnections.map((failedConnection) => {
						return ` ${failedConnection.ipAddress}:${failedConnection.port}`
					})
					equipmentManager.failedConnections = []
					return message
				} else {
					return message
				}
			} else if (rule === 'byTimer') {
				equipmentManager.checkAllConnections()
				if (equipmentManager.failedConnections.length !== 0) {
					message = 'Не удалось подключиться к следующим адресам: ' + equipmentManager.failedConnections.map((failedConnection) => {
						return ` ${failedConnection.ipAddress}:${failedConnection.port}`
					})
					return message
				} else {
					return message
				}
			}
		})
	}
}

export default new PrinterIpc