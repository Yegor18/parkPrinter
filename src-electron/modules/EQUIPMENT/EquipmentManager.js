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
		for (let castPrinter of this.castPrinters) {
			if (castPrinter.isActive) {
				dataSourceManager.turnOnDataSource(castPrinter.dataSourceId)
			}
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

	updateCastPrinter(printerId, newDriverName, updatedPrinter, newTemplate) {
		let newDriver = this.createDriver(newDriverName, updatedPrinter, newTemplate.template)
		this.castPrinters.forEach((castPrinter) => {
			if (castPrinter.id === printerId) {
				castPrinter.driver.stop()
				castPrinter.isActive = false
				this.requestToTurnOffDataSource(castPrinter)
				if (castPrinter.driver instanceof EndToEndPrinterDriver) {
					castPrinter.driver.closeServer()
				}
				castPrinter.driver = newDriver
				castPrinter.dataSourceId = updatedPrinter.data_source_id
				castPrinter.templateData = newTemplate
			}
		})
	}

	addCastPrinter(printerId, driverName, newPrinter, newTemplate) {
		let driver = this.createDriver(driverName, newPrinter, newTemplate.template)
		this.castPrinters.push({ id: printerId, name: newPrinter.name, isActive: false, dataSourceId: newPrinter.data_source_id, driver: driver, templateData: newTemplate })
	}

	deleteCastPrinter(printerId) {
		this.castPrinters = this.castPrinters.filter((castPrinter) => {
			if (castPrinter.id !== printerId) {
				return castPrinter
			} else {
				castPrinter.driver.stop()
				if (castPrinter.driver instanceof EndToEndPrinterDriver) {
					castPrinter.driver.closeServer()
				}
				this.requestToTurnOffDataSource(castPrinter)
			}
		})
	}

	setIsActive(printerId, isActive) {
		this.castPrinters.forEach((castPrinter) => {
			if (castPrinter.id === printerId) {
				castPrinter.isActive = isActive
				if (isActive) {
					this.requestToTurnOnDataSource(castPrinter)
				} else {
					this.requestToTurnOffDataSource(castPrinter)
				}
			}
		})
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

	distributeData(dataSourceId, data) {
		this.castPrinters.forEach((castPrinter) => {
			if (dataSourceId === castPrinter.dataSourceId && castPrinter.isActive) {
				castPrinter.driver.write(data)
			}
		})
	}

	requestToTurnOnDataSource(printer) {
		console.log(`\nЗАПРОС НА ВКЛЮЧЕНИЕ ИСТОЧНИКА ДАННЫХ С id ${printer.dataSourceId}`)
		let count = 0
		this.castPrinters.forEach((castPrinter) => {
			if (castPrinter.isActive && castPrinter.dataSourceId === printer.dataSourceId) {
				count++
			}
		})
		if (count > 0) {
			dataSourceManager.turnOnDataSource(printer.dataSourceId)
		}
	}

	requestToTurnOffDataSource(printer) {
		console.log(`\nЗАПРОС НА ОТКЛЮЧЕНИЕ ИСТОЧНИКА ДАННЫХ С id ${printer.dataSourceId}`)
		let workingPrinters = 0
		let stoppedPrinters = 0
		this.castPrinters.forEach((castPrinter) => {
			if (castPrinter.isActive && castPrinter.dataSourceId === printer.dataSourceId) {
				workingPrinters++
			} else if (!castPrinter.isActive && castPrinter.dataSourceId === printer.dataSourceId) {
				stoppedPrinters++
			}
		})
		if (workingPrinters === 0 && stoppedPrinters > 0) {
			dataSourceManager.turnOffDataSource(printer.dataSourceId)
		}
	}
}

const equipmentManager = new EquipmentManager()

export default equipmentManager