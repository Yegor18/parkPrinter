import net from 'node:net'
import { MainWindow } from '../../helpers.js'
import dataSourceManager from '../DataSourceManager.js'
import DataSource from './DataSource.js'

class EndToEndTcpDataSource extends DataSource {
	constructor(id, type, port) {
		super(() => {
			console.log('\nИСТОЧНИК ДАННЫХ ВКЛЮЧАЕТСЯ')
			this.server.listen(this.port, () => {
				console.log(`\n===> ПОРТ ${this.port}: ПОРТ ОТКРЫТ`)
			})
		},
			() => {
				console.log('\nИСТОЧНИК ДАННЫХ ВЫКЛЮЧАЕТСЯ')
				this.closeServer()
			})
		this.id = id
		this.type = type
		this.port = port
		this.server = net.createServer((client) => {
			client.setEncoding('utf-8')
			client.on('data', (data) => {
				console.log(`\n===> ПОРТ ${this.port}: ОТПРАВЛЕНИЕ ДАННЫХ ИЗ TCP (Сквозной)`)
				console.log('\nДАННЫЕ')
				console.log(data)
				dataSourceManager.setDataForSending(this.id, [data])
			})
			client.on('close', () => {
				console.log(`\n===> ПОРТ ${this.port}: КЛИЕНТ ОТКЛЮЧИЛСЯ`)
			})
		})
		this.server.on('connection', () => {
			console.log(`\n===> ПОРТ ${this.port}: КЛИЕНТ ПОДКЛЮЧИЛСЯ`)
		})
		this.server.on('close', () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ЗАКРЫТ`)
		})
		this.server.on('error', (error) => {
			console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
			if (error.code === 'EADDRINUSE') {
				new MainWindow().window.webContents.send('opening-port-fail', `Порт ${this.port} уже занят`)
			}
		})
	}

	closeServer() {
		if (this.server.listening) {
			this.server.close((error) => {
				if (error) {
					console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАКРЫТИИ ПОРТА:`)
					console.log(error)
				}
			})
		}
	}
}

export default EndToEndTcpDataSource