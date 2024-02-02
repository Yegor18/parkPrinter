import { ipcMain } from 'electron'
import Driver from '../../models/driver'
import { unwrap } from '../../modules/helpers'

class DriverIpc {
  constructor() {
    // получение списка драйверов 
    ipcMain.handle('get-drivers', async () => {
      return unwrap(await Driver.findAll())
    })
  }
}

export default new DriverIpc