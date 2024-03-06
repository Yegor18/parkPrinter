import { ipcMain } from 'electron'
import { tcpPingPort } from 'tcp-ping-port'
import Printer from '../../DB/models/Printer.js'
import Driver from '../../DB/models/Driver.js'
import { unwrap } from '../../helpers.js'
import equipmentManager from '../../EQUIPMENT/EquipmentManager.js'
import DataSource from '../../DB/models/DataSource.js'
import Template from '../../DB/models/Template.js'

class PrinterIpc {
	constructor() {
		// получение списка принтеров
		ipcMain.handle('get-printers', async () => {
			return unwrap(await Printer.findAll({ include: [ { model: Driver }, { model: DataSource }, { model: Template } ] })).map((printer) => {
        if (printer.DataSource === null) {
          printer.DataSource = { message: 'Без источника данных' }
        }
        printer.config = JSON.parse(printer.config)
        return printer
      })
		})

		// добавление нового принтера или изменение существующего
		ipcMain.handle('save-or-update-printer', async (event, printer) => {
			let driver = unwrap(await Driver.findOne({ where: { name: printer.driver } }))
			let dataSource = unwrap(await DataSource.findOne({ where: { name: printer.dataSource } }))
			let template = unwrap(await Template.findOne({ where: { name: printer.template } }))
      let existingPrinter = {}
      switch (printer.driver) {
        case 'Файловый принтер':
        case 'Сквозной TCP принтер':
          existingPrinter = unwrap(await Printer.findOne({ where: { name: printer.name, template_id: template.id, config: JSON.stringify(printer.config) } }))
          break
        default:
          existingPrinter = unwrap(await Printer.findOne({ where: { name: printer.name, template_id: template.id, ipAddress: printer.ipAddress, port: printer.port } }))
      }
			if (existingPrinter === null || existingPrinter.data_source_id === null) {
				let newPrinter = { name: printer.name, driver_id: driver.id, ipAddress: printer.ipAddress, port: printer.port, is_active: false, data_source_id: dataSource.id, config: JSON.stringify(printer.config), template_id: template.id }
				if (printer.id === '') {
					await Printer.create(newPrinter)
					let printerId = unwrap(await Printer.max('id'))
					equipmentManager.addCastPrinter(printerId, printer.driver, newPrinter, template.template)
				} else {
					await Printer.update(newPrinter, { where: { id: printer.id } })
					equipmentManager.updateCastPrinter(printer.id, printer.driver, newPrinter, template.template)
				}
				return 'printer-created-or-updated'
			} else {
				return 'this-printer-already-exists'
			}
		})

		// удаление принтера по id
		ipcMain.handle('delete-printer', async (event, printerId) => {
			await Printer.destroy({ where: { id: printerId } })
			equipmentManager.deleteCastPrinter(printerId)
		})

		// проверка подключения к принтеру
		ipcMain.handle('test-connection', async (event, printerIpAddress) => {
			let result = await tcpPingPort(printerIpAddress)
			return result.online
		})

		// включение и отключение принтера
		ipcMain.handle('turn-on-off-printer', async (event, { printerId, operation }) => {
			let driverModel = equipmentManager.castPrinters.find((castPrinter) => castPrinter.id === printerId).driver
			if (operation === 'on') {
				if (!driverModel.check() && await driverModel.start()) {
					await Printer.update({ is_active: true }, { where: { id: printerId } })
          equipmentManager.setIsActive(printerId, true)
					return { type: 'ok-on', message: 'Подключение установлено!' }
				} else {
					return { type: 'error-on', message: 'Не удалось подключиться!' }
				}
			} else if (operation === 'off') {
				if (driverModel.check() && driverModel.stop()) {
					await Printer.update({ is_active: false }, { where: { id: printerId } })
					equipmentManager.setIsActive(printerId, false)
					return { type: 'ok-off', message: 'Отключение выполнить удалось!' }
				} else {
					return { type: 'error-off', message: 'Возникла ошибка, проверьте все подключения!' }
				}
			}
		})

		// проверка подключения при старте и по таймеру
		ipcMain.handle('get-failed-connections-to-printers', async () => {
			let message = ''
			let failedConnections = await equipmentManager.checkAllConnections()
			if (failedConnections.length !== 0) {
				message = 'Не удалось подключиться к следующим принтерам: ' + failedConnections.map((failedConnection) => {
					return ` ${failedConnection.printer} (${failedConnection.ipAddress}:${failedConnection.port})`
				})
				return message
			}
			return message
		})
	}
}

export default new PrinterIpc