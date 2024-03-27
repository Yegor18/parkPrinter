import net from 'node:net'
import TCPIPEquipment from './TCPIPEquipment.js'
import { MainWindow } from '../../helpers.js'

export default class EndToEndPrinterDriver extends TCPIPEquipment {
	constructor(port) {
		super('localhost', port)
		this.port = port
		this.server = net.createServer((client) => {
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
		this.server.on('connection', () => {
			console.log(`\n===> ПОРТ ${this.port}: КЛИЕНТ ПОДКЛЮЧИЛСЯ`)
		})
		this.server.on('close', () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ЗАКРЫТ`)
		})
		this.server.on('error', (error) => {
			console.log(`\n===> ПОРТ: ${this.port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
			if (error.code === 'EADDRINUSE') {
				new MainWindow().window.webContents.send('opening-port-fail', `Порт ${this.port} уже занят`)
			}
		})
		this.server.listen(this.port, () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ОТКРЫТ`)
		})
	}

	closeServer() {
		this.server.close((error) => {
			if (error) {
				console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАКРЫТИИ ПОРТА:`)
				console.log(error)
			}
		})
	}
}
