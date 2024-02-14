import { ipcMain } from 'electron'
import DataSource from '../../DB/models/DataSource.js'
import { unwrap } from '../../helpers.js'

class DataSourceIpc {
  constructor() {
    // получение списка источников данных
    ipcMain.handle('get-data-sources', async () => {
      return unwrap(await DataSource.findAll())
    })
  }
}

export default new DataSourceIpc