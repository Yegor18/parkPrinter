import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import { unwrap } from '../helpers.js'
import DikaiDriver from './drivers/DikaiDriver.js'
import LogopackDriver from './drivers/LogopackDriver.js'
import WindowsDriver from './drivers/WindowsDriver.js'

class EquipmentManager {
	constructor() {
		this.castPrinters = []
	}

  async start() {
    await this.createCastPrinters()
    let printers = this.castPrinters
    for (let i = 0; i < printers.length; i++) {
      const printer = printers[i]
      if (printer.isActive) {
        try {
          await printer.driver.start()
        } catch (error) {
          console.log(`НЕ УДАЛОСЬ ПОДКЛЮЧИТСЯ К ПРИНТЕРУ: ${error}`)
        }
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
        this.castPrinters[i].driver = driverModel
      }
    }
	}

	addCastPrinter(printerId, driverName, newPrinter) {
		let driverModel = this.createDriverModel(driverName, newPrinter.ipAddress, newPrinter.port)
    this.castPrinters.push({ id: printerId, driver: driverModel })
	}

	deleteCastPrinter(printerId) {
    this.castPrinters = this.castPrinters.filter((castPrinter) => castPrinter.id !== printerId)
    console.log(this.castPrinters)
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
}

const equipmentManager = new EquipmentManager()

export default equipmentManager