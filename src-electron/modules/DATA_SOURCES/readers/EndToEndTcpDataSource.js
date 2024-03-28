import net from 'node:net'
import { MainWindow } from '../../helpers.js'
import TCPDataSource from "app/src-electron/modules/DATA_SOURCES/readers/TCPDataSource";

class EndToEndTcpDataSource extends TCPDataSource {
	constructor(id, type, port) {
		super()
		this.id = id
		this.type = type
		this.port = port
		this.server = net.createServer((server) => {
			server.setEncoding('utf-8')
			console.log(`\n===> ПОРТ ${this.port}: СЕРВЕР ПОДКЛЮЧИЛСЯ`)
			server.on('close', () => {
				console.log(`\n===> ПОРТ ${this.port}: ПОРТ ЗАКРЫТ`)
			})
			server.on('error', (error) => {
				console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАПУСКЕ: ${error}`)
				if (error.code === 'EADDRINUSE') {
					new MainWindow().window.webContents.send('opening-port-fail', `Порт ${this.port} уже занят`)
				}
			})
			server.on('data', async(data) => {
				console.log(`\n===> ПОРТ ${this.port}: ОТПРАВЛЕНИЕ ДАННЫХ ИЗ TCP (Сквозной)`)
				console.log('\nДАННЫЕ')
				console.log(data)
				await printer.write([data])
			})

		})
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

	async readSourceAndWriteToPrinter(printer) {
		console.log("Read data from source")
		this.server.listen(this.port, () => {
			console.log(`\n===> ПОРТ ${this.port}: ПОРТ ОТКРЫТ`)
		})
	}

}

export default EndToEndTcpDataSource
