import dataSourceManager from '../DATA_SOURCES/DataSourceManager.js'
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

class EquipmentManager {
	constructor() {
		this.castPrinters = []
	}

	async start() {
		await this.createCastPrinters()
		let failedPrinters = []
		for (let castPrinter of this.castPrinters) {
			if (castPrinter.isActive && !(await castPrinter.driver.start())) {
				failedPrinters.push(castPrinter)
			}
		}
		if (failedPrinters.length !== 0) {
			setTimeout(() => {
				new MainWindow().window.webContents.send('failed-connections', 'Не удалось подключиться к принтерам: ' + failedPrinters.map((failedPrinter) => {
					return ` ${failedPrinter.name} (${failedPrinter.driver.ipAddress}:${failedPrinter.driver.port})`
				}))
			}, 5000)
		}
		await dataSourceManager.createCastDataSources(this.castPrinters)
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
				template: printer.Template.template
			}
			castPrinter.driver = this.createDriver(printer.Driver.name, printer, castPrinter.template)
			if (printer.DataSource !== null) {
				castPrinter.dataSourceId = printer.DataSource.id
			}
			return castPrinter
		})
		this.castPrinters = castPrinters
	}

	updateCastPrinter(printerId, newDriverName, updatedPrinter, newTemplate) {
		let printer = this.castPrinters.find((castPrinter) => castPrinter.id === printerId)
		printer.driver.stop()
		if (printer.driver instanceof EndToEndPrinterDriver) {
			printer.driver.closeServer()
		}
		let newDriver = this.createDriver(newDriverName, updatedPrinter, newTemplate)
		for (let i = 0; i < this.castPrinters.length; i++) {
			if (this.castPrinters[i].id === printerId) {
				this.castPrinters[i].isActive = false
				this.castPrinters[i].driver = newDriver
				this.castPrinters[i].dataSourceId = updatedPrinter.data_source_id
				this.castPrinters[i].template = newTemplate
				dataSourceManager.updatePrintersInDataSource(this.castPrinters[i], 'update')
			}
		}
	}

	addCastPrinter(printerId, driverName, newPrinter, newTemplate) {
		let driver = this.createDriver(driverName, newPrinter, newTemplate)
		let printer = { id: printerId, name: newPrinter.name, isActive: false, dataSourceId: newPrinter.data_source_id, driver: driver, template: newTemplate }
		this.castPrinters.push(printer)
		dataSourceManager.updatePrintersInDataSource(printer, 'add')
	}

	deleteCastPrinter(printerId) {
		let printer = this.castPrinters.find((castPrinter) => castPrinter.id === printerId)
		printer.driver.stop()
		if (printer.driver instanceof EndToEndPrinterDriver) {
			printer.driver.closeServer()
		}
		printer = {}
		this.castPrinters = this.castPrinters.filter((castPrinter) => {
			if (castPrinter.id !== printerId) {
				return castPrinter
			} else {
				printer = castPrinter
			}
		})
		dataSourceManager.updatePrintersInDataSource(printer, 'delete')
	}

	setIsActive(printerId, isActive) {
		let printer = this.castPrinters.find((castPrinter) => castPrinter.id === printerId)
		this.castPrinters[this.castPrinters.indexOf(printer)].isActive = isActive
		printer.isActive = isActive
		dataSourceManager.updatePrintersInDataSource(printer, 'update')
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