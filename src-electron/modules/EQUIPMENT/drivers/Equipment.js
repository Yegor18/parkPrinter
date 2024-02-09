import net from 'node:net'
import { tcpPingPort } from 'tcp-ping-port'

// сделать геттер на принтеры по id
export default class Equipment {
	constructor(ipAddress, port) {
		this.ipAddress = ipAddress
		this.port = port
	}

	async start() {
		let ping = await tcpPingPort(this.ipAddress, parseInt(this.port)).then((result) => { return result })
		if (ping.online !== true) {
			console.log(`===> НЕ УДАЛОСЬ ПОДКЛЮЧИТЬСЯ: ${this.ipAddress}:${this.port}`)
			return false
		}
		this.connection = new net.createConnection(this.port, this.ipAddress)
		return this.connection.on('connect', () => {
			this.isStarted = true
			console.log(`===> ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО: ${this.ipAddress}:${this.port}`)
		}).connecting
	}

	stop() {
		if (this.connection) {
			this.connection.end()
			this.connection.destroy()
			this.isStarted = false
			console.log(`===> ОТКЛЮЧЕНИЕ ВЫПОЛНИТЬ УДАЛОСЬ: ${this.ipAddress}:${this.port}`);
			return true
		} else {
			return false
		}
	}

	write(data) {
		try {
			this.connection.write(data)
			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	check() {
		return this.isStarted
	}
}