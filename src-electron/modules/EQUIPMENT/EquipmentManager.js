import dataSourceManager from '../DATA_SOURCES/DataSourceManager.js'
import DataSource from '../DB/models/DataSource.js'
import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import { unwrap } from '../helpers.js'
import DikaiDriver from './drivers/DikaiDriver.js'
import EndToEndPrinterDriver from './drivers/EndToEndPrinterDriver.js'
import FilePrinterDriver from './drivers/FilePrinterDriver.js'
import LogopackDriver from './drivers/LogopackDriver.js'
import WindowsDriver from './drivers/WindowsDriver.js'

class EquipmentManager {
	constructor() {
		this.castPrinters = []
	}

  async start() {
    await this.createCastPrinters()
    for (let castPrinter of this.castPrinters) {
      if (castPrinter.isActive) {
        await castPrinter.driver.start()
      }
    }
		await dataSourceManager.createCastDataSources(this.castPrinters)
  }

  async createCastPrinters() {
    let printers = unwrap(await Printer.findAll({ include: [ { model: Driver }, { model: DataSource } ] }))
    let castPrinters = printers.map((printer) => {
			let castPrinter = {
				id: printer.id,
				name: printer.name,
				isActive: printer.is_active,
				dataSourceId: '',
				driver: {}
			}
      castPrinter.driver = this.createDriver(printer.Driver.name, printer)
			if (printer.DataSource !== null) {
				castPrinter.dataSourceId = printer.DataSource.id
			}
			return castPrinter
    })
    this.castPrinters = castPrinters
		console.log('=== AT START ===')
		console.log(this.castPrinters)
  }

	updateCastPrinter(printerId, newDriverName, updatedPrinter) {
    let newDriver = this.createDriver(newDriverName, updatedPrinter)
		for (let i = 0; i < this.castPrinters.length; i++) {
      if (this.castPrinters[i].id === printerId) {
				this.castPrinters[i].isActive = false
        this.castPrinters[i].driver = newDriver
				this.castPrinters[i].dataSourceId = updatedPrinter.data_source_id
      }
    }
		console.log(`=== AFTER UPDATE ${printerId} ===`)
		console.log(this.castPrinters)
	}

	addCastPrinter(printerId, driverName, newPrinter) {
		let driver = this.createDriver(driverName, newPrinter)
    this.castPrinters.push({ id: printerId, name: newPrinter.name, isActive: false, dataSourceId: newPrinter.data_source_id, driver: driver })
		console.log(`=== AFTER ADD ${printerId} ===`)
		console.log(this.castPrinters)
	}

	deleteCastPrinter(printerId) {
    this.castPrinters = this.castPrinters.filter((castPrinter) => castPrinter.id !== printerId)
		console.log(`=== AFTER DELETE ${printerId} ===`)
		console.log(this.castPrinters)
	}

  createDriver(driverName, printer) {
    let ipAddress = printer.ipAddress
    let port = printer.port
		let config = JSON.parse(printer.config)
    let driver = {}
    switch (driverName) {
      case 'logopack':
        driver = new LogopackDriver(ipAddress, port)
        break
      case 'dikai':
        driver = new DikaiDriver(ipAddress, port)
        break
      case 'windows':
        driver = new WindowsDriver(ipAddress, port)
        break
      case 'Файловый принтер':
        driver = new FilePrinterDriver(config.pathToFile)
        break
      case 'Сквозной TCP принтер':
        driver = new EndToEndPrinterDriver(config.port)
        break
    }
    return driver
  }

	async checkAllConnections() {
		let failedConnections = []
		for (let i = 0; i < this.castPrinters.length; i++) {
			const printer = this.castPrinters[i]
      if (!printer.driver.check() && printer.isActive) {
				failedConnections.push({ printerId: printer.id, printer: printer.name, ipAddress: printer.driver.ipAddress, port: printer.driver.port })
				this.castPrinters[i].isActive = false
			}
		}
		return failedConnections
	}
}

const equipmentManager = new EquipmentManager()

export default equipmentManager