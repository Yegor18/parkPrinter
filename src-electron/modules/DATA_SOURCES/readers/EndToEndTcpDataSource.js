import net from 'node:net'
import DataSource from './DataSource.js'
import { MainWindow } from '../../helpers.js'

class EndToEndTcpDataSource extends DataSource {
	constructor(port, printers) {
		super(printers)
		this.port = port
		let server = net.createServer((client) => {
			client.setEncoding('utf-8')
			client.on('data', (data) => {
				for (let printer of this.printers) {
					if (printer.driver.check()) {
						printer.driver.write(data)
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
}

export default EndToEndTcpDataSource