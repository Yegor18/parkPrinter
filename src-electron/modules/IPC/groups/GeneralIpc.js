import { ipcMain } from 'electron'
import { checkFile, portIsOpen } from '../../helpers.js'

class GeneralIpc {
	constructor() {
		ipcMain.handle('test-port', (event, port) => {
			return portIsOpen(port)
		})

		ipcMain.handle('check-file', (event, pathToFile) => {
			return checkFile(pathToFile)
		})
	}
}

export default new GeneralIpc