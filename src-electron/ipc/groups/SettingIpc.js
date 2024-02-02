import { ipcMain } from 'electron'
import Setting from '../../models/Setting'
import { unwrap } from '../../modules/helpers'

class SettingIpc {
	constructor() {
		// обновление настроек приложения
    ipcMain.handle('save-settings', async (event, settings) => {
      for (let i = 0; i < settings.length; i++) {
        try {
          await Setting.update({ value: settings[i].value }, { where: { id: settings[i].id } })
        } catch (e) {
          console.log(e.original)
        }
      }
    })

		// получение существующих настроек
    ipcMain.handle('get-settings', async () => {
      return unwrap(await Setting.findAll())
    })
	}
}

export default new SettingIpc