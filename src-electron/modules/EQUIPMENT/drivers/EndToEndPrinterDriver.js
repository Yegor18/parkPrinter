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
				console.log(`===> ПОРТ: ${this.port}: ПОЛУЧИЛИ ОТ КЛИЕНТА: ${data}`)
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