import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import { unwrap } from '../helpers.js'
import DikaiDriver from './drivers/DikaiDriver.js'
import LogopackDriver from './drivers/LogopackDriver.js'
import WindowsDriver from './drivers/WindowsDriver.js'

class EquipmentManager {
	constructor() {
		this.castPrinters = []
		this.failedConnections = []
	}

  async start() {
    await this.createCastPrinters()
    for (let i = 0; i < this.castPrinters.length; i++) {
      const printer = this.castPrinters[i]
      if (printer.isActive) {
        await printer.driver.start().then(async (result) => {
					if (!result) {
						this.failedConnections.push({ ipAddress: printer.driver.ipAddress, port: printer.driver.port })
					}
				})
      }
    }
  }

  async createCastPrinters() {
    let printers = []
    try {
      printers = unwrap(await Printer.findAll({ include: { model: Driver } }))
    } catch (error) {
      console.log(error)
    }
    let castPrinters = printers.map((printer) => {
      let castPrinter = {
        id: printer.id,
				isActive: printer.is_active,
        driver: { }
      }
      castPrinter.driver = this.createDriverModel(printer.Driver.name, printer.ipAddress, printer.port)
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

  createDriverModel(driverName, ipAddress, port) {
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
    }
    return driverModel
  }

	checkAllConnections() {
		this.failedConnections = []
		for (let i = 0; i < this.castPrinters.length; i++) {
			const printer = this.castPrinters[i]
      if (!printer.driver.check() && printer.isActive) {
				this.failedConnections.push({ ipAddress: printer.driver.ipAddress, port: printer.driver.port })
			}
		}
	}
}

const equipmentManager = new EquipmentManager()

export default equipmentManager