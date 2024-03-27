import DataSource from '../DB/models/DataSource'
import TypeOfDataSource from '../DB/models/TypeOfDataSource'
import equipmentManager from '../EQUIPMENT/EquipmentManager'
import { unwrap } from '../helpers.js'
import CsvDataSource from './readers/CsvDataSource'
import DataTcpDataSource from './readers/DataTcpDataSource'
import EndToEndTcpDataSource from './readers/EndToEndTcpDataSource'
import XlsDataSource from './readers/XlsDataSource.js'

class DataSourceManager {
	constructor() {
		this.castDataSources = []
	}

	get(dataSourceId) {
		return this.castDataSources.find((castDataSource) =>
		   castDataSource.id === dataSourceId
		)
	}

	async createCastDataSources() {
		let dataSources = unwrap(await DataSource.findAll({ include: { model: TypeOfDataSource } }))
		this.castDataSources = dataSources.map((dataSource) => {
			return this.createDataSourceConfig(dataSource.id, dataSource.TypeOfDataSource.name, JSON.parse(dataSource.config))
		})
	}

	addCastDataSource(dataSourceId, typeName, dataSourceConfig) {
		this.castDataSources.push(this.createDataSourceConfig(dataSourceId, typeName, dataSourceConfig))
	}

	deleteCastDataSource(dataSourceId) {
		this.castDataSources = this.castDataSources.filter((castDataSource) => {
			if (castDataSource.id !== dataSourceId) {
				return castDataSource
			} else {
				castDataSource.stop()
			}
		})
	}

	createDataSourceConfig(id, typeName, dataSourceConfig) {
		switch (typeName) {
			case 'XLS':
				return new XlsDataSource(id, typeName, dataSourceConfig.pathToFile, dataSourceConfig.pollingFrequency)
			case 'CSV':
				return new CsvDataSource(id, typeName, dataSourceConfig.pathToFile, dataSourceConfig.pollingFrequency)
			case 'TCP (Данные)':
				return new DataTcpDataSource(id, typeName, dataSourceConfig.port, dataSourceConfig.mask)
			case 'TCP (Сквозной)':
				return new EndToEndTcpDataSource(id, typeName, dataSourceConfig.port)
		}
	}

	setDataForSending(dataSourceId, data) {
		equipmentManager.distributeData(dataSourceId, data)
	}

	turnOnDataSource(dataSourceId) {
		this.castDataSources.forEach((castDataSource) => {
			if (castDataSource.id === dataSourceId && !castDataSource.isStarted) {
				castDataSource.start()
			}
		})
	}

	turnOffDataSource(dataSourceId) {
		this.castDataSources.forEach((castDataSource) => {
			if (castDataSource.id === dataSourceId && castDataSource.isStarted) {
				castDataSource.stop()
			}
		})
	}
}

const dataSourceManager = new DataSourceManager()

export default dataSourceManager
