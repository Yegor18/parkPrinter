import { ipcMain } from 'electron'
import Driver from '../../models/driver.js'
import { unwrap } from '../../modules/helpers.js'

module.exports = {
  getDrivers:
    // получение списка драйверов 
    ipcMain.handle('get-drivers', async () => {
      return unwrap(await Driver.findAll())
    })
}