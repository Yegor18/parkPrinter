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
          await printer.driver.model.start()
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
        name: printer.name,
        isActive: printer.is_active,
        driver: { id: printer.Driver.id, name: printer.Driver.name, model: null }
      }
      switch (printer.Driver.name) {
        case 'logopack':
          castPrinter.driver.model = new LogopackDriver(printer.ipAddress, printer.port)
          break
        case 'dikai':
          castPrinter.driver.model = new DikaiDriver(printer.ipAddress, printer.port)
          break
        case 'windows':
          castPrinter.driver.model = new WindowsDriver(printer.ipAddress, printer.port)
          break
      }
      return castPrinter
    })
    this.castPrinters = castPrinters
  }

	async updateCastPrinter(printer) {
		
	}

	async addCastPrinter(printer) {
		
	}

	async deleteCastPrinter(printerId) {

	}
}

const equipmentManager = new EquipmentManager()

export default equipmentManager