import { ipcMain } from 'electron'
import Driver from '../../models/driver.js'
import { unwrap } from '../../modules/helpers.js'

class DriverIpc {
	constructor() {
		// получение списка драйверов 
		ipcMain.handle('get-drivers', async () => {
			return unwrap(await Driver.findAll())
		})
	}
}

export default new DriverIpc