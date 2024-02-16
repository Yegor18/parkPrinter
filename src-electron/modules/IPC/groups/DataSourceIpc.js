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
				let castDataSource = { id: dataSource.id, name: dataSource.name, config: { }, TypeOfDataSource: dataSource.TypeOfDataSource }
				let config = dataSource.config.split('|')
				switch (dataSource.TypeOfDataSource.name) {
					case 'XLS':
					case 'CSV':
						castDataSource.config = { pathToFile: config[0], pollingFrequency: config[1] }
						break
					case 'API Endpoint':
						castDataSource.config = { token: config[0] }
						break
					case 'TCP (Данные)':
						castDataSource.config = { port: config[0], mask: config[1] }
						break
					case 'TCP (Сквозной)':
						castDataSource.config = { port: config[0] }
						break
				}
				castDataSources.push(castDataSource)
			}
      return castDataSources
    })

		// сохранение нового источника данных
		ipcMain.handle('save-new-data-source', async (event, newDataSource) => {
			let typeId = unwrap(await TypeOfDataSource.findOne({ where: { name: newDataSource.type } })).id
			let configString = ''
			switch (newDataSource.type) {
				case 'XLS':
				case 'CSV':
					configString = newDataSource.config.pathToFile + '|' + newDataSource.config.pollingFrequency
					break
				case 'API Endpoint':
					configString = newDataSource.config.token
					break
				case 'TCP (Данные)':
					configString = newDataSource.config.port + '|' + newDataSource.config.mask
					break
				case 'TCP (Сквозной)':
					configString = newDataSource.config.port
					break
			}
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