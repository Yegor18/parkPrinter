import Driver from '../DB/models/Driver.js'
import Printer from '../DB/models/Printer.js'
import { unwrap } from '../helpers.js'
import DikaiDriver from './drivers/DikaiDriver.js'
import LogopackDriver from './drivers/LogopackDriver.js'
import WindowsDriver from './drivers/WindowsDriver.js'

export default start = async () => {
  let printers
  try {
    printers = unwrap(await Printer.findAll({ include: { model: Driver } }))
  } catch(error) {
    console.log(error)
  }
  printers.map((printer) => {
    switch(printer.Driver.name) {
      case 'logopack':
        printer.Driver.model = new LogopackDriver()
        break
      case 'dikai':
        printer.Driver.model = new DikaiDriver()
        break
      case 'windows':
        printer.Driver.model = new WindowsDriver()
        break
    }
  })
  console.log(printers)
}