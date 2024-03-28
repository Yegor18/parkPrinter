import { ipcMain } from 'electron'
import { tcpPingPort } from 'tcp-ping-port'
import Printer from '../../DB/models/Printer.js'
import Driver from '../../DB/models/Driver.js'
import { portIsOpen, unwrap } from '../../helpers.js'
import equipmentManager from '../../EQUIPMENT/EquipmentManager.js'
import DataSource from '../../DB/models/DataSource.js'
import Template from '../../DB/models/Template.js'

class PrinterIpc {
	constructor() {
		// получение списка принтеров
		ipcMain.handle('get-printers', async () => {
			return unwrap(await Printer.findAll({ include: [{ model: Driver }, { model: DataSource }, { model: Template }] })).map((printer) => {
				if (printer.DataSource === null) {
					printer.DataSource = { message: 'Без источника данных' }
				}
				printer.config = JSON.parse(printer.config)
				return printer
			})
		})

		// добавление нового принтера или изменение существующего
		ipcMain.handle('save-or-update-printer', async (event, { printer, operation }) => {
			console.log('\nДАННЫЕ ПРИНТЕРА НА СОХРАНЕНИЕ:')
			console.log(printer)
			let existingPrinter = {}
			switch (printer.driver) {
				case 'logopack':
				case 'dikai':
				case 'windows':
					existingPrinter = await this.findExistingPrinter({ ipAddress: printer.ipAddress, port: printer.port })
					break
				case 'Файловый принтер':
					existingPrinter = await this.findExistingPrinter({ config: JSON.stringify(printer.config) })
					break
				case 'Сквозной TCP принтер':
					existingPrinter = await this.findExistingPrinter({ config: JSON.stringify(printer.config) })
					break
			}
			if ((operation === 'add' && existingPrinter !== null) || (operation === 'update' && existingPrinter !== null && existingPrinter.id !== printer.id)) {
				console.log('\nПРИНТЕР УЖЕ СУЩЕСТВУЕТ С ТАКИМИ НАСТРОЙКАМИ:')
				console.log(existingPrinter)
				return 'printer-already-exists'
			}
			let driver = unwrap(await Driver.findOne({ where: { name: printer.driver } }))
			let dataSource = unwrap(await DataSource.findOne({ where: { name: printer.dataSource } }))
			let template = unwrap(await Template.findOne({ where: { name: printer.template } }))
			let newPrinter = { name: printer.name, driver_id: driver.id, ipAddress: printer.ipAddress, port: printer.port, is_active: false, data_source_id: dataSource.id, config: JSON.stringify(printer.config), template_id: template.id }
			if (printer.id === '') {
				await Printer.create(newPrinter)
				let printerId = unwrap(await Printer.max('id'))
				await equipmentManager.addCastPrinter(printerId, printer.driver, newPrinter, template)
			} else {
				await Printer.update(newPrinter, { where: { id: printer.id } })
				await equipmentManager.updateCastPrinter(printer.id, printer.driver, newPrinter, template)
			}
		})

		// удаление принтера по id
		ipcMain.handle('delete-printer', async (event, printerId) => {
			await Printer.destroy({ where: { id: printerId } })
			await equipmentManager.deleteCastPrinter(printerId)
		})

		// проверка подключения к принтеру
		ipcMain.handle('test-connection', async (event, { printerIpAddress, printerPort }) => {
			let result = await tcpPingPort(printerIpAddress, printerPort)
			return result.online
		})

		// включение и отключение принтера
		//принтеры подключаются и отключаются при старте приложения или при нажатии на кнопку.
		//соответственно функция обработки должна быть одна
		ipcMain.handle('turn-on-off-printer', async (event, {options, operation }) => {
			let {printerId,dataSourceId} = options
			console.log("equipmentManager.castPrinters ",equipmentManager.castPrinters)
			let driverModel = equipmentManager.castPrinters.find((castPrinter) => castPrinter.id === printerId).driver
			if (operation === 'on') {
					await Printer.update({ is_active: true }, { where: { id: printerId } })
					//Пишем геттер для менеджера
					await equipmentManager.sendDataSourceToPrinter(printerId,dataSourceId)
					return { type: 'ok-on', message: 'Данные отправлены!' }
			} else if (operation === 'off') {
					await Printer.update({ is_active: false }, { where: { id: printerId } })
					await equipmentManager.turnOffPrinterAndDataSource(printerId,dataSourceId)
					return { type: 'ok-off', message: 'Отключение выполнить удалось!' }
			}
		})
	}

	async findExistingPrinter(searchParams) {
		console.log('\nДАННЫЕ ДЛЯ ПОИСКА СУЩЕСТВУЮЩЕГО ПРИНТЕРА ПО ОСНОВНЫМ НАСТРОЙКАМ:')
		console.log(searchParams)
		return unwrap(await Printer.findOne({ where: searchParams }))
	}
}

export default new PrinterIpc
