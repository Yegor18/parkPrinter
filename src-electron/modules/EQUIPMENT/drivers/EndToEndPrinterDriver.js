import net from 'node:net'
import Equipment from './Equipment.js'

export default class EndToEndPrinterDriver extends Equipment {
  constructor(port) {
    super('localhost', port)
    this.port = port
		let server = net.createServer((client) => {
			client.setEncoding('utf-8');
			client.on('data', (data) => {
				console.log(data)
			})
			client.on('error', (error) => {
				console.log(`ON PORT: ${error}`)
			})
		})
		server.listen(this.port, () => {
			console.log(`SERVER STARTED ON ${this.port} PORT`)
			server.on('connection', () => {
				console.log(`CLIENT CONNECTED TO ${this.port} PORT`)
			})
			server.on('error', (error) => {
				console.log(error)
			})
		})
  }
}