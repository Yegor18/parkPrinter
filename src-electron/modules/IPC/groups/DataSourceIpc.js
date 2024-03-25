import { ipcMain } from 'electron'
import DataSource from '../../DB/models/DataSource.js'
import TypeOfDataSource from '../../DB/models/TypeOfDataSource.js'
import { portIsOpen, unwrap } from '../../helpers.js'
import dataSourceManager from '../../DATA_SOURCES/DataSourceManager.js'
import { Op } from 'sequelize'
import Printer from '../../DB/models/Printer.js'
import equipmentManager from '../../EQUIPMENT/EquipmentManager.js'

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
			let existingDataSource = {}
			let existingMainConfig = {}
			switch (newDataSource.type) {
				case 'CSV':
				case 'XLS':
					existingDataSource = unwrap(await DataSource.findOne({ where: { config: { [Op.substring]: JSON.stringify(newDataSource.config.pathToFile) } } }))
					if (existingDataSource !== null) {
						existingMainConfig = JSON.parse(existingDataSource.config).pathToFile
					}
					break
				case 'TCP (Данные)':
				case 'TCP (Сквозной)':
					existingDataSource = unwrap(await DataSource.findOne({ where: { config: { [Op.substring]: JSON.stringify(newDataSource.config.port) } } }))
					if (existingDataSource !== null) {
						existingMainConfig = JSON.parse(existingDataSource.config).port
					}
					break
			}
			if (existingDataSource !== null && (existingMainConfig.pathToFile === newDataSource.config.pathToFile || existingMainConfig.port === newDataSource.config.port)) {
				return 'data-source-already-exists'
			}
			if ((newDataSource.type === 'TCP (Данные)' || newDataSource.type === 'TCP (Сквозной)') && portIsOpen(newDataSource.config.port)) {
				await this.save(newDataSource)
				return 'ok'
			} else if (newDataSource.type !== 'TCP (Данные)' && newDataSource.type !== 'TCP (Сквозной)') {
				await this.save(newDataSource)
				return 'ok'
			} else {
				return 'saving-is-not-possible'
			}
		})

		ipcMain.handle('delete-data-source', async (event, dataSourceId) => {
			await Printer.update({ data_source_id: null }, { where: { data_source_id: dataSourceId } })
			await DataSource.destroy({ where: { id: dataSourceId } })
			dataSourceManager.deleteCastDataSource(dataSourceId)
			equipmentManager.setEmptyDataSource(dataSourceId)
		})
	}

	async save(newDataSource) {
		let typeId = unwrap(await TypeOfDataSource.findOne({ where: { name: newDataSource.type } })).id
		await DataSource.create({ name: newDataSource.name, type_id: typeId, config: JSON.stringify(newDataSource.config) })
		let dataSourceId = unwrap(await DataSource.max('id'))
		dataSourceManager.addCastDataSource(dataSourceId, newDataSource.type, newDataSource.config)
	}
}

export default new DataSourceIpc