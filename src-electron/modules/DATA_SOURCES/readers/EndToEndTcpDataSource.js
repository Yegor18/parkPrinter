import net from 'node:net'
import { MainWindow } from '../../helpers.js'
import dataSourceManager from '../DataSourceManager.js'

class EndToEndTcpDataSource {
	constructor(id, type, port) {
		this.id = id
		this.type = type
		this.port = port
		let server = net.createServer((client) => {
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
		server.on('connection', () => {
			console.log(`\n===> ПОРТ ${this.port}: КЛИЕНТ ПОДКЛЮЧИЛСЯ`)
		})
		server.on('close', () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ЗАКРЫТ`)
		})
		server.on('error', (error) => {
			console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
			if (error.code === 'EADDRINUSE') {
				new MainWindow().window.webContents.send('opening-port-fail', `Порт ${this.port} уже занят`)
			}
		})
		server.listen(this.port, () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ОТКРЫТ`)
		})
	}
}

export default EndToEndTcpDataSource