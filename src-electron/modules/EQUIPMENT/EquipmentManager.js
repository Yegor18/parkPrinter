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
    let printers = unwrap(await Printer.findAll({ include: [ { model: Driver }, { model: DataSource }, { model: Template } ] }))
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
    let printer = {}
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