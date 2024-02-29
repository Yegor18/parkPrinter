import net from 'node:net'

class DataTcpDataSource {
  constructor(port, mask, printers) {
    this.port = port
    this.mask = mask
		this.printers = printers
		let server = net.createServer((client) => {
			client.setEncoding('utf-8');
			client.on('data', (data) => {
				for (let printer of printers) {
          if (printer.driver.check()) {
            printer.driver.write(data)
          }
        }
			})
			client.on('error', (error) => {
				console.log(`ON PORT: ${error}`)
			})
		})
		server.listen(this.port, () => {
			console.log(`SERVER STARTED ON ${this.port} PORT`)
      console.log('===> MASK' + mask)
			server.on('connection', () => {
				console.log(`CLIENT CONNECTED TO ${this.port} PORT`)
			})
			server.on('error', (error) => {
				console.log(error)
			})
		})
  }
}

export default DataTcpDataSource