import net from 'node:net'
import Equipment from './Equipment.js'

export default class EndToEndPrinterDriver extends Equipment {
  constructor(ipAddress, port) {
		let defaultPort = 8190
		let server = net.createServer((client) => {
			client.setEncoding('utf-8');
			client.on('data', (data) => {
				console.log(data)
			})
			client.on('error', (error) => {
				console.log(`ON PORT: ${error}`)
			})
		})
		server.listen(defaultPort, () => {
			console.log(`SERVER STARTED ON ${defaultPort} PORT`)
			server.on('connection', () => {
				console.log(`CLIENT CONNECTED TO ${defaultPort} PORT`)
			})
			server.on('error', (error) => {
				console.log(error)
			})
		})
    super('localhost', defaultPort)
  }
}