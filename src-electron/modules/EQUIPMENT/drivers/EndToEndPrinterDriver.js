import net from 'node:net'
import Equipment from './Equipment.js'
import { MainWindow } from '../../helpers.js'

export default class EndToEndPrinterDriver extends Equipment {
	constructor(port) {
		super('localhost', port)
		this.port = port
		let server = net.createServer((client) => {
			client.setEncoding('utf-8')
			client.on('data', (data) => {
				console.log(`\n===> ПОРТ ${this.port}: ПОЛУЧЕНЫ ДАННЫЕ ОТ КЛИЕНТА`)
				console.log('\nДАННЫЕ')
				console.log(data)
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
			console.log(`\n===> ПОРТ: ${this.port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
			if (error.code === 'EADDRINUSE') {
				new MainWindow().window.webContents.send('opening-port-fail', `Порт ${this.port} уже занят`)
			}
		})
		server.listen(this.port, () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ОТКРЫТ`)
		})
	}
}