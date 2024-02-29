import net from 'node:net'
import { tcpPingPort } from 'tcp-ping-port'

// сделать геттер на принтеры по id
export default class Equipment {
	constructor(ipAddress, port) {
		this.ipAddress = ipAddress
		this.port = port
		this.connection = new net.Socket()
		this.connection.on('connect', () => {
			this.isStarted = true
			console.log(`===> ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО: ${this.ipAddress}:${this.port}`)
		})
		this.connection.on('error', () => {
			this.isStarted = false
			console.log(`===> ВОЗНИКЛА ОШИБКА НА ПОДКЛЮЧЕНИИ: ${this.ipAddress}:${this.port}`)
		})
	}

	async start() {
		let ping = await tcpPingPort(this.ipAddress, parseInt(this.port))
		if (ping.online !== true) {
			this.isStarted = false
			console.log(`===> НЕ УДАЛОСЬ ПОДКЛЮЧИТЬСЯ: ${this.ipAddress}:${this.port}`)
			return false
		}
		this.connection.connect(this.port, this.ipAddress)
		return true
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

	check() {
		return this.isStarted
	}
}