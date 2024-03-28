import net from 'node:net'
import { MainWindow } from '../../helpers.js'
import TCPIPEquipment from "app/src-electron/modules/EQUIPMENT/drivers/TCPIPEquipment";

export default class EndToEndPrinterDriver  {
	constructor(port) {

		this.port = port
		this.isStarted =false
		this.client = new TCPIPEquipment("127.0.0.1",this.port)
		this.server = net.createServer((server) => {
			console.log(`\n===> ПОРТ ${this.port}: СЕРВЕР ПОДКЛЮЧИЛСЯ`)
			server.setEncoding('utf-8')
			server.on('data', (data) => {
				console.log(`\n===> ПОРТ ${this.port}: ПОЛУЧЕНЫ ДАННЫЕ ОТ КЛИЕНТА`)
				console.log('\nДАННЫЕ')
				console.log(data)
			})
			server.on('close', () => {
				this.isStarted =false
				console.log(`\n===> ПОРТ ${this.port}: СЕРВЕР ОТКЛЮЧИЛСЯ`)
			})
			server.on('error', (error) => {
				this.isStarted =false
				console.log(`\n===> ПОРТ: ${this.port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
				if (error.code === 'EADDRINUSE') {
					new MainWindow().window.webContents.send('opening-port-fail', `Порт ${this.port} уже занят`)
				}
			})
		})
	}

	start() {
		this.server.listen(this.port, () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ОТКРЫТ`)
			let isClientConnect = this.client.connection.connect(this.port, '127.0.0.1')
			if (isClientConnect.connecting) {
				this.isStarted = true
			}
		})
	}

	write(data) {
		this.client.write(data)
	}

	close() {
		this.server.close((error) => {
			if (error) {
				console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАКРЫТИИ ПОРТА:`)
				console.log(error)
			} else {
				this.client.connection.destroy()
			}
		})
	}
}
