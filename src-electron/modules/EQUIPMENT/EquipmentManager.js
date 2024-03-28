import DataSource from '../DB/models/DataSource.js'
import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import Template from '../DB/models/Template.js'
import { unwrap } from '../helpers.js'
import DikaiDriver from './drivers/DikaiDriver.js'
import EndToEndPrinterDriver from './drivers/EndToEndPrinterDriver.js'
import FilePrinterDriver from './drivers/FilePrinterDriver.js'
import LogopackDriver from './drivers/LogopackDriver.js'
import WindowsDriver from './drivers/WindowsDriver.js'
import { MainWindow } from '../helpers.js'
import dataSourceManager from '../DATA_SOURCES/DataSourceManager.js'

class EquipmentManager {
	constructor() {
		this.castPrinters = []
	}

	//при отключении принтера ничего не происходит!!!
	async start() {
		await this.createCastPrinters()
		let activePrinters = this.castPrinters.filter((printer) => printer.isActive)
		for (let printer of activePrinters) {
			await this.sendDataSourceToPrinter(printer.id,printer.dataSourceId)
		}
	}

	getPrinter(printerId) {
		return this.castPrinters.find((castPrinter) => castPrinter.id === printerId)
	}

	async sendDataSourceToPrinter(printerId,dataSourceId) {
		const printer = this.getPrinter(printerId)
		const dataSource = dataSourceManager.get(dataSourceId)

		if (Object.getPrototypeOf(dataSource.constructor).name === "FileDataSource") {
			printer.driver.start()
			dataSource.timer = setInterval(async () => {
			const isDataSourceValid = await dataSource.isValid()
			if (printer.driver.isStarted && isDataSourceValid) {
				await dataSource.readSourceAndWriteToPrinter(printer.driver)
			} else {
				clearInterval(dataSource.timer)

				new MainWindow().window.webContents.send('failed-connections', 'Не удалось отправить данные на принтер: ' +
					` ${printer.name} (${printer.driver.ipAddress}:${printer.driver.port})`)
			}
			}, dataSource.pollingFrequency)
		}


	}

	async turnOffPrinterAndDataSource(printerId,dataSourceId) {
		const printer = this.getPrinter(printerId)
		const dataSource = dataSourceManager.get(dataSourceId)
		const isDataSourceValid = await dataSource.isValid()
		if (printer.driver.isStarted) {
			const isPrinterStopped = printer.driver.close()
		}
		if (isDataSourceValid) {
			if (dataSource.close) {
				dataSource.close()
			}
			clearInterval(dataSource.timer)
		}
	}

	async createCastPrinters() {
		let printers = unwrap(await Printer.findAll({ include: [{ model: Driver }, { model: DataSource }, { model: Template }] }))
		let castPrinters = printers.map((printer) => {
			let castPrinter = {
				id: printer.id,
				name: printer.name,
				isActive: printer.is_active,
				dataSourceId: '',
				driver: {},
				templateData: printer.Template
			}
			castPrinter.driver = this.createDriver(printer.Driver.name, printer, castPrinter.templateData.template)
			if (printer.DataSource !== null) {
				castPrinter.dataSourceId = printer.DataSource.id
			}
			return castPrinter
		})
		this.castPrinters = castPrinters
	}

	async updateCastPrinter(printerId, newDriverName, updatedPrinter, newTemplate) {
		let newDriver = this.createDriver(newDriverName, updatedPrinter, newTemplate.template)
		let printer = this.getPrinter(printerId)
		if (printer) {
			await printer.driver.close()
			printer.isActive = false
				await this.turnOffPrinterAndDataSource(printerId,printer.dataSourceId)
				if (printer.driver instanceof EndToEndPrinterDriver) {
					await printer.driver.close()
				}
			printer.driver = newDriver
			printer.dataSourceId = updatedPrinter.data_source_id
			printer.templateData = newTemplate
			}
	}

	addCastPrinter(printerId, driverName, newPrinter, newTemplate) {
		let driver = this.createDriver(driverName, newPrinter, newTemplate.template)
		this.castPrinters.push({ id: printerId, name: newPrinter.name, isActive: false, dataSourceId: newPrinter.data_source_id, driver: driver, templateData: newTemplate })
	}

	async deleteCastPrinter(printerId) {
		let printer = this.getPrinter(printerId)
		if (printer) {
			await printer.driver.close()
			await this.turnOffPrinterAndDataSource(printerId,printer.dataSourceId)
		}
	}

	updateTemplateData(templateData) {
		this.castPrinters.forEach((castPrinter) => {
			if (castPrinter.templateData.id === templateData.id) {
				castPrinter.templateData.template = templateData.template
			}
		})
	}

	setEmptyTemplate(oldTemplateId, emptyTemplateData) {
		this.castPrinters.forEach((castPrinter) => {
			if (castPrinter.templateData.id === oldTemplateId) {
				castPrinter.templateData = emptyTemplateData
				if (castPrinter.driver.template !== undefined) {
					castPrinter.driver.template = emptyTemplateData.template
				}
			}
		})
	}

	setEmptyDataSource(oldDataSourceId) {
		this.castPrinters.forEach((castPrinter) => {
			if (castPrinter.dataSourceId === oldDataSourceId) {
				castPrinter.dataSourceId = ''
			}
		})
		console.log(this.castPrinters)
	}

	createDriver(driverName, printer, template) {
		let ipAddress = printer.ipAddress
		let port = printer.port
		let config = JSON.parse(printer.config)
		switch (driverName) {
			case 'logopack':
				return new LogopackDriver(ipAddress, port)
			case 'dikai':
				return new DikaiDriver(ipAddress, port)
			case 'windows':
				return new WindowsDriver(ipAddress, port)
			case 'Файловый принтер':
				return new FilePrinterDriver(config.pathToFile, template)
			case 'Сквозной TCP принтер':
				return new EndToEndPrinterDriver(config.port)
		}
	}
}

const equipmentManager = new EquipmentManager()

export default equipmentManager
