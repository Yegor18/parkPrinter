import { ipcMain } from 'electron'
import Driver from '../../models/Driver'
import { unwrap } from '../../modules/helpers'

class DriverIpc {
  constructor() {
    // получение списка драйверов 
    ipcMain.handle('get-drivers', async () => {
      let namesOfDrivers = unwrap(await Driver.findAll()).map((driver) => driver.name)
      return namesOfDrivers
    })
  }
}

export default new DriverIpc