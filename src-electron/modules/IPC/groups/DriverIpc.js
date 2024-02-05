import { ipcMain } from 'electron'
import Driver from '../../DB/models/Driver.js'
import { unwrap } from '../../helpers.js'

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