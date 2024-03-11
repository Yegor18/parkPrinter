import net from 'node:net'
import DataSource from './DataSource.js'
import { MainWindow } from '../../helpers.js'

class DataTcpDataSource extends DataSource {
	constructor(port, mask, printers) {
		super(printers)
		this.port = port
		this.mask = mask
		let server = net.createServer((client) => {
			client.setEncoding('utf-8');
			client.on('data', (data) => {
				for (let printer of this.printers) {
					if (printer.driver.check()) {
						printer.driver.write(this.prepareData(data))
					}
				}
			})
			client.on('close', () => {
				console.log(`===> ПОРТ: ${this.port}: КЛИЕНТ ОТКЛЮЧИЛСЯ`)
			})
		})
		server.on('connection', () => {
			console.log(`===> ПОРТ: ${this.port}: КЛИЕНТ ПОДКЛЮЧИЛСЯ`)
		})
		server.on('close', () => {
			console.log(`===> ПОРТ: ${this.port}: ПОРТ ЗАКРЫТ`)
		})
		server.on('error', (error) => {
			console.log(`===> ПОРТ: ${this.port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
			if (error.code === 'EADDRINUSE') {
				new MainWindow().window.webContents.send('opening-port-fail', `Порт ${this.port} уже занят`)
			}
		})
		server.listen(this.port, () => {
			console.log(`===> ПОРТ: ${this.port}: ПОРТ ОТКРЫТ`)
		})
	}

	prepareData(data) {
		let result = []
		let separators = this.mask.split('[name]')[1].split('[value]')
		while (data !== '') {
			let hold = data.split(separators[0])
			let name = hold[0]
			let value = hold[1].substring(0, hold[1].indexOf(separators[1]))
			// let variable = {}
			// variable[name] = value
			result.push({ name: name, value: value })
			data = data.substring(data.indexOf(separators[1]) + 1)
		}
		return result
	}
}

export default DataTcpDataSource