import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import { unwrap } from '../helpers.js'
import DikaiDriver from './drivers/DikaiDriver.js'
import LogopackDriver from './drivers/LogopackDriver.js'
import WindowsDriver from './drivers/WindowsDriver.js'

export default getPrinters = async () => {
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
      ipAddress: printer.ipAddress,
      port: printer.port,
      isActive: printer.is_active,
      driver: { id: printer.Driver.id, name: printer.Driver.name, model: {} }
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
  return castPrinters
}