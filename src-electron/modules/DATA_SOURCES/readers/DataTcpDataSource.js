import net from 'node:net'
import {checkFile, MainWindow} from '../../helpers.js'
import {tcpPingPort} from "tcp-ping-port";
import TCPDataSource from "app/src-electron/modules/DATA_SOURCES/readers/TCPDataSource";

class DataTcpDataSource extends TCPDataSource {
	constructor(id, type, port, mask) {
		super()
		this.id = id
		this.type = type
		this.port = port
		this.mask = mask
		this.server = net.createServer((server) => {
			server.setEncoding('utf-8');
			console.log(`\n===> ПОРТ ${this.port}: КЛИЕНТ ПОДКЛЮЧИЛСЯ`)
			server.on('close', () => {
				console.log(`\n===> ПОРТ ${this.port}: КЛИЕНТ ОТКЛЮЧИЛСЯ`)
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
			server.on('data', (data) => {
				let preparedData = this.prepareData(data)
				if (preparedData !== null) {
					console.log(`\n===> ПОРТ ${this.port}: ОТПРАВЛЕНИЕ ПОДГОТОВЛЕННЫХ ДАННЫХ ИЗ TCP (Данные)`)
					console.log('\nДАННЫЕ')
					console.log(preparedData)
					printer.write([preparedData])
				} else {
					console.log(`\n===> ПОРТ ${this.port}: ПОЛУЧЕНЫ НЕВЕРНЫЕ ДАННЫЕ, ДАННЫЕ НЕЛЬЗЯ ОБРАБОТАТЬ СОГЛАСНО МАСКЕ`)
					console.log('\nДАННЫЕ')
					console.log(data)
					console.log('\nМАСКА')
					console.log(this.mask)
					new MainWindow().window.webContents.send('data-is-not-valid-for-tcp-data-data-source', `Ошибка на слушающем порту ${this.port} в источнике данных TCP (Данные): получили неверные данные, данные нельзя обработать согласно маске. Данные: ${data} Маска: ${this.mask}`)
				}
			})
		})

	}

	async isValid() {
		return await tcpPingPort(this.ipAddress, parseInt(this.port))
	}

	close() {
		if (this.server.listening) {
			this.server.close((error) => {
				if (error) {
					console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАКРЫТИИ ПОРТА:`)
					console.log(error)
				}
			})
		}
	}

	readSourceAndWriteToPrinter(printer) {
		console.log("Read data from source")
		this.server.listen(this.port, () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ОТКРЫТ`)
		})
	}
}

export default DataTcpDataSource
