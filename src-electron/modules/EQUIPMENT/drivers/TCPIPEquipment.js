import net from 'node:net'
import { tcpPingPort } from 'tcp-ping-port'
import Equipment from "app/src-electron/modules/EQUIPMENT/drivers/Equipment";

// сделать геттер на принтеры по id
export default class TCPIPEquipment extends Equipment{
	constructor(ipAddress, port) {
		super()
		this.ipAddress = ipAddress
		this.port = port
		this.connection = new net.Socket()
		this.connection.on('connect', () => {
			this.isStarted = true
			console.log(`\n===> ${this.ipAddress}:${this.port}: ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО`)
			this.connection.on('error', (error) => {
				this.isStarted = false
				console.log(`\n===> ${this.ipAddress}:${this.port}: ВОЗНИКЛА ОШИБКА: ${error}`)
			})
			this.connection.on('close', () => {
				this.isStarted = false
				console.log(`\n===> ${this.ipAddress}:${this.port}: СОЕДИНЕНИЕ ЗАКРЫЛОСЬ`)
			})
		})

	}

	async start() {
		let ping = await tcpPingPort(this.ipAddress, parseInt(this.port))
		if (ping.online !== true) {
			this.isStarted = false
			console.log(`\n===> ${this.ipAddress}:${this.port}: НЕ УДАЛОСЬ ПОДКЛЮЧИТЬСЯ`)
			return false
		}
		this.connection.connect(this.port, this.ipAddress)
		return true
	}

	stop() {
		if (this.connection) {
			this.connection.destroy()
			this.isStarted = false
			console.log(`\n===> ${this.ipAddress}:${this.port}: ОТКЛЮЧЕНИЕ ВЫПОЛНИТЬ УДАЛОСЬ`)
			return true
		} else {
			return false
		}
	}
	write(data) {
		try {
			console.log(`\n===> ${this.port}: ПОЛУЧЕНЫ ДАННЫЕ ОТ ИСТОЧНИКА ДАННЫХ`)
			console.log('\nДАННЫЕ')
			console.log(data)
			if (Array.isArray(data)) {
				for (let row of data) {
					this.connection.write(JSON.stringify(row) + '\n')
				}
			} else {
				this.connection.write(data + '\n')
			}
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

}
