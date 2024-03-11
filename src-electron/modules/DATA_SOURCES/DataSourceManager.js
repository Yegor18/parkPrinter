import net from 'node:net'
import { MainWindow } from '../helpers.js'
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
		if (operation === 'update') {
			for (let i = 0; i < this.castDataSources.length; i++) {
				for (let j = 0; j < this.castDataSources[i].config.printers.length; j++) {
					if (printer.id === this.castDataSources[i].config.printers[j].id) {
						this.castDataSources[i].config.updateListPrinters(printer, 'delete')
					}
				}
				if (printer.dataSourceId === this.castDataSources[i].id) {
					this.castDataSources[i].config.updateListPrinters(printer, 'add')
				}
			}
		} else {
			for (let i = 0; i < this.castDataSources.length; i++) {
				if (printer.dataSourceId === this.castDataSources[i].id) {
					this.castDataSources[i].config.updateListPrinters(printer, operation)
				}
			}
		}
	}

	portIsOpen(port) {
		let server = net.createServer()
		server.on('error', (error) => {
			console.log(`===> ПОРТ: ${port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
			if (error.code === 'EADDRINUSE') {
				new MainWindow().window.webContents.send('opening-port-fail', `Порт ${port} уже занят`)
			}
		})
		server.listen(port)
		if (server.listening) {
			server.close()
			return true
		} else {
			server.close()
			return false
		}
	}
}

const dataSourceManager = new DataSourceManager()

export default dataSourceManager