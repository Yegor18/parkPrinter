import { ipcMain } from 'electron'
import Setting from '../../DB/models/Setting.js'
import { unwrap } from '../../helpers.js'

class SettingIpc {
	constructor() {
		// обновление настроек приложения
		ipcMain.handle('save-settings', async (event, settings) => {
			for (let i = 0; i < settings.length; i++) {
				await Setting.update({ value: settings[i].value }, { where: { id: settings[i].id } })
			}
		})

		// получение существующих настроек
		ipcMain.handle('get-settings', async () => {
			return unwrap(await Setting.findAll())
		})
	}
}

export default new SettingIpc