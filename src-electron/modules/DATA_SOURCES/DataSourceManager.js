import DataSource from '../DB/models/DataSource'
import TypeOfDataSource from '../DB/models/TypeOfDataSource'
import { unwrap } from '../helpers.js'
import CsvDataSource from './readers/CsvDataSource'
import DataTcpDataSource from './readers/DataTcpDataSource'
import EndToEndTcpDataSource from './readers/EndToEndTcpDataSource'
import XlsDataSource from './readers/XlsDataSource.js'

class DataSourceManager {
	constructor() {
		this.castDataSources = []
	}

	async createCastDataSources(printers) {
		let dataSources = unwrap(await DataSource.findAll({ include: { model: TypeOfDataSource } }))
		this.castDataSources = dataSources.map((dataSource) => {
			let castDataSource = { id: dataSource.id, typeName: dataSource.TypeOfDataSource.name, config: {} }
			let printersBelongingToDataSource = printers.filter((printer) => printer.dataSourceId === dataSource.id)
			castDataSource.config = this.createDataSourceConfig(dataSource.TypeOfDataSource.name, JSON.parse(dataSource.config), printersBelongingToDataSource)
			return castDataSource
		})
	}

	addCastDataSource(dataSourceId, typeName, dataSourceConfig) {
		this.castDataSources.push({ id: dataSourceId, typeName: typeName, config: this.createDataSourceConfig(typeName, dataSourceConfig, []) })
	}

	createDataSourceConfig(typeName, dataSourceConfig, printersBelongingToDataSource) {
		switch (typeName) {
			case 'XLS':
				return new XlsDataSource(dataSourceConfig.pathToFile, dataSourceConfig.pollingFrequency, printersBelongingToDataSource)
			case 'CSV':
				return new CsvDataSource(dataSourceConfig.pathToFile, dataSourceConfig.pollingFrequency, printersBelongingToDataSource)
			case 'TCP (Данные)':
				return new DataTcpDataSource(dataSourceConfig.port, dataSourceConfig.mask, printersBelongingToDataSource)
			case 'TCP (Сквозной)':
				return new EndToEndTcpDataSource(dataSourceConfig.port, printersBelongingToDataSource)
		}
	}

	updatePrintersInDataSource(printer, operation) {
		this.castDataSources.find((castDataSource) => castDataSource.id === printer.dataSourceId).config.updateListPrinters(printer, operation)
	}
}

const dataSourceManager = new DataSourceManager()

export default dataSourceManager