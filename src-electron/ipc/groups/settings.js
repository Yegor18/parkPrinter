import { ipcMain } from 'electron'
import Setting from '../../models/setting.js'
import { unwrap } from '../../modules/helpers.js'

module.exports = {
  saveSettings:
    // обновление настроек приложения
    ipcMain.handle('save-settings', async (event, settings) => {
      for (let i = 0; i < settings.length; i++) {
        try {
          await Setting.update({ value: settings[i].value }, { where: { id: settings[i].id } })
        } catch (e) {
          console.log(e.original)
        }
      }
    }),

  getSettings:
    // получение существующих настроек
    ipcMain.handle('get-settings', async () => {
      return unwrap(await Setting.findAll())
    })
}