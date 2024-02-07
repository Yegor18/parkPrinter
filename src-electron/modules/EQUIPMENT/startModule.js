import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import { unwrap } from '../helpers.js'
import DikaiDriver from './drivers/DikaiDriver.js'
import LogopackDriver from './drivers/LogopackDriver.js'
import WindowsDriver from './drivers/WindowsDriver.js'

export default start = async () => {
  let printers = []
  try {
    printers = unwrap(await Printer.findAll({ include: { model: Driver } }))
  } catch(error) {
    console.log(error)
  }
  let castPrinters = []
  for (let i = 0; i < printers.length; i++) {
    
    let castPrinter = {
      id: printers[i].id,
      name: printers[i].name,
      ipAddress: printers[i].ipAddress,
      port: printers[i].port,
      is_active: printers[i].is_active,
      driver: { id: printers[i].Driver.id, name: printers[i].Driver.name, model: {} }
    }
    if (printers[i].is_active === 1) {
      switch(printers[i].Driver.name) {
        case 'logopack':
          castPrinter.driver.model = new LogopackDriver(printers[i].ipAddress, printers[i].port)
          break
        case 'dikai':
          castPrinter.driver.model = new DikaiDriver(printers[i].ipAddress, printers[i].port)
          break
        case 'windows':
          castPrinter.driver.model = new WindowsDriver(printers[i].ipAddress, printers[i].port)
          break
      }
    }
    castPrinters.push(castPrinter)
  }
  console.log(castPrinters)
}