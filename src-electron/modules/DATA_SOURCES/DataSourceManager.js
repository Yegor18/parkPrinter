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

	async createCastDataSources() {
		let dataSources = unwrap(await DataSource.findAll({ include: { model: TypeOfDataSource } }))
		this.castDataSources = dataSources.map((dataSource) => {
			return this.createDataSourceConfig(dataSource.id, dataSource.TypeOfDataSource.name, JSON.parse(dataSource.config))
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
}

const dataSourceManager = new DataSourceManager()

export default dataSourceManager