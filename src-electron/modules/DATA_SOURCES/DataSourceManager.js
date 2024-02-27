import DataSource from '../DB/models/DataSource'
import TypeOfDataSource from '../DB/models/TypeOfDataSource'
import { unwrap } from '../helpers.js'
import XlsDataSource from './readers/XlsDataSource.js'

class DataSourceManager {
	async createCastDataSources(printers) {
		let dataSources = unwrap(await DataSource.findAll({ include: { model: TypeOfDataSource } }))
		let castDataSources = dataSources.map((dataSource) => {
			let castDataSource = {
				id: dataSource.id,
				typeName: dataSource.TypeOfDataSource.name,
				config: {}
			}
			let printersBelongingToDataSource = printers.filter((printer) => printer.dataSourceId === dataSource.id)
			switch (dataSource.TypeOfDataSource.name) {
				case 'XLS':
					castDataSource.config = new XlsDataSource(JSON.parse(dataSource.config).pathToFile, JSON.parse(dataSource.config).pollingFrequency, printersBelongingToDataSource)
					break
			}
		})
	}
}

const dataSourceManager = new DataSourceManager()

export default dataSourceManager