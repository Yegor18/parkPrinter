import { ipcMain } from 'electron'
import DataSource from '../../DB/models/DataSource.js'
import TypeOfDataSource from '../../DB/models/TypeOfDataSource.js'
import { unwrap } from '../../helpers.js'

class DataSourceIpc {
  constructor() {
		// получение списка типов источников данных
		ipcMain.handle('get-types-of-data-sources', async () => {
      return unwrap(await TypeOfDataSource.findAll()).map((type) => { return type.name })
    })

    // получение списка источников данных
    ipcMain.handle('get-data-sources', async () => {
			let dataSources = unwrap(await DataSource.findAll({ include: { model: TypeOfDataSource } }))
			let castDataSources = []
			for (let dataSource of dataSources) {
				castDataSources.push({ id: dataSource.id, name: dataSource.name, config: JSON.parse(dataSource.config), TypeOfDataSource: dataSource.TypeOfDataSource })
			}
      return castDataSources
    })

		// сохранение нового источника данных
		ipcMain.handle('save-new-data-source', async (event, newDataSource) => {
			let typeId = unwrap(await TypeOfDataSource.findOne({ where: { name: newDataSource.type } })).id
			let configString = JSON.stringify(newDataSource.config)
			let existingDataSource = unwrap(await DataSource.findOne({ where: { name: newDataSource.name, type_id: typeId, config: configString } }))
			if (existingDataSource === null) {
				await DataSource.create({ name: newDataSource.name, type_id: typeId, config: configString })
				return true
			} else {
				return false
			}
		})
  }
}

export default new DataSourceIpc