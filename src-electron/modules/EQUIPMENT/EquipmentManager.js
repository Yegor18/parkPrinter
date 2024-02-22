import DataSource from '../DB/models/DataSource.js'
import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import TypeOfDataSource from '../DB/models/TypeOfDataSource.js'
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
    for (let i = 0; i < this.castPrinters.length; i++) {
      const printer = this.castPrinters[i]
      if (printer.isActive) {
        await printer.driver.start()
      }
    }
  }

  async createCastPrinters() {
    let printers = unwrap(await Printer.findAll({ include: [ { model: Driver }, { model: DataSource } ] }))
    let castPrinters = printers.map((printer) => {
      let castPrinter = {
        id: printer.id,
				name: printer.name,
				isActive: printer.is_active,
        driver: { },
        dataSource: { }
      }
      castPrinter.driver = this.createDriverModel(printer.Driver.name, printer.ipAddress, printer.port)
      castPrinter.dataSource = this.createDataSource(printer.DataSource)
      return castPrinter
    })
    this.castPrinters = castPrinters
  }

	updateCastPrinter(printerId, newDriverName, ipAddress, port) {
    let driverModel = this.createDriverModel(newDriverName, ipAddress, port)
		for (let i = 0; i < this.castPrinters.length; i++) {
      if (this.castPrinters[i].id === printerId) {
				this.castPrinters[i].isActive = false
        this.castPrinters[i].driver = driverModel
      }
    }
	}

	addCastPrinter(printerId, driverName, newPrinter) {
		let driverModel = this.createDriverModel(driverName, newPrinter.ipAddress, newPrinter.port)
    this.castPrinters.push({ id: printerId, isActive: false, driver: driverModel })
	}

	deleteCastPrinter(printerId) {
    this.castPrinters = this.castPrinters.filter((castPrinter) => castPrinter.id !== printerId)
	}

  createDriverModel(driverName, ipAddress, port, dataSource) {
    let driverModel
    switch (driverName) {
      case 'logopack':
        driverModel = new LogopackDriver(ipAddress, port)
        break
      case 'dikai':
        driverModel = new DikaiDriver(ipAddress, port)
        break
      case 'windows':
        driverModel = new WindowsDriver(ipAddress, port)
        break
      case 'Файловый принтер':
        driverModel = new FilePrinterDriver(ipAddress, port)
        break
      case 'Сквозной TCP принтер':
        driverModel = new EndToEndPrinterDriver(ipAddress, port)
        break
    }
    return driverModel
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

  async createDataSource(dataSource) {
    if (dataSource !== null) {
      let typeNameOfDataSource = await TypeOfDataSource.findOne({ where: { id: dataSource.id } })
      switch (typeNameOfDataSource) {
        case '':
          break
      }
    }
  }
}

const equipmentManager = new EquipmentManager()

export default equipmentManager