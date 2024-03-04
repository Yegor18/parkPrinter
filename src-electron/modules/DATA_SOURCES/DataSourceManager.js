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
			let castDataSource = {
				id: dataSource.id,
				typeName: dataSource.TypeOfDataSource.name,
				config: {}
			}
			let printersBelongingToDataSource = printers.filter((printer) => printer.dataSourceId === dataSource.id)
      let dataSourceConfig = JSON.parse(dataSource.config)
			switch (dataSource.TypeOfDataSource.name) {
				case 'XLS':
					castDataSource.config = new XlsDataSource(dataSourceConfig.pathToFile, dataSourceConfig.pollingFrequency, printersBelongingToDataSource)
          break
        case 'CSV':
					castDataSource.config = new CsvDataSource(dataSourceConfig.pathToFile, dataSourceConfig.pollingFrequency, printersBelongingToDataSource)
					break
        case 'TCP (Данные)':
          castDataSource.config = new DataTcpDataSource(dataSourceConfig.port, dataSourceConfig.mask, printersBelongingToDataSource)
          break
        case 'TCP (Сквозной)':
          castDataSource.config = new EndToEndTcpDataSource(dataSourceConfig.port, printersBelongingToDataSource)
          break
			}
		})
	}

	addCastDataSource() {
		
	}
}

const dataSourceManager = new DataSourceManager()

export default dataSourceManager