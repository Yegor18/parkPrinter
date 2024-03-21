import net from 'node:net'
import { MainWindow } from '../../helpers.js'
import dataSourceManager from '../DataSourceManager.js'
import DataSource from './DataSource.js'

class DataTcpDataSource extends DataSource {
	constructor(id, type, port, mask) {
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
		this.mask = mask
		this.server = net.createServer((client) => {
			client.setEncoding('utf-8');
			client.on('data', (data) => {
				let preparedData = this.prepareData(data)
				if (preparedData !== null) {
					console.log(`\n===> ПОРТ ${this.port}: ОТПРАВЛЕНИЕ ПОДГОТОВЛЕННЫХ ДАННЫХ ИЗ TCP (Данные)`)
					console.log('\nДАННЫЕ')
					console.log(preparedData)
					dataSourceManager.setDataForSending(this.id, [preparedData])
				} else {
					console.log(`\n===> ПОРТ ${this.port}: ПОЛУЧЕНЫ НЕВЕРНЫЕ ДАННЫЕ, ДАННЫЕ НЕЛЬЗЯ ОБРАБОТАТЬ СОГЛАСНО МАСКЕ`)
					console.log('\nДАННЫЕ')
					console.log(data)
					console.log('\nМАСКА')
					console.log(this.mask)
					new MainWindow().window.webContents.send('data-is-not-valid-for-tcp-data-data-source', `Ошибка на слушающем порту ${this.port} в источнике данных TCP (Данные): получили неверные данные, данные нельзя обработать согласно маске. Данные: ${data} Маска: ${this.mask}`)
				}
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
		this.server.close((error) => {
			if (error) {
				console.log(`\n===> ПОРТ ${this.port}: ОШИБКА ПРИ ЗАКРЫТИИ ПОРТА:`)
				console.log(error)
			}
		})
	}

	prepareData(data) {
		let separators = this.mask.split('[name]')[1].split('[value]')
		let variables = {}
		while (data !== '') {
			let hold = data.split(separators[0])
			if (hold.length === 1 || hold[1] === '' || !hold[1].includes(separators[1])) {
				return null
			}
			let name = hold[0]
			let value = hold[1].substring(0, hold[1].indexOf(separators[1]))
			variables[name] = value
			data = data.substring(data.indexOf(separators[1]) + 1)
		}
		return variables
	}
}

export default DataTcpDataSource