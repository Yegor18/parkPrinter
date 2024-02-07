import net from 'node:net'

// сделать геттер на принтеры по id
export default class Equipment {
  constructor(ipAddress, port) {
    this.ipAddress = ipAddress
    this.port = port
  }

  start() {
    this.connection = new net.createConnection(this.port, this.ipAddress, () => { this.isConnected = true })
    return this.isConnected
  }
  stop() {
    this.connection.destroy()
    return this.connection.destroyed()
  }
  write(data) {
    return this.connection.write(data)
  }
  check() {
    return this.isConnected
  }
}