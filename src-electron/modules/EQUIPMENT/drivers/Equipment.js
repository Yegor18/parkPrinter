import net from 'node:net'
import { tcpPingPort } from 'tcp-ping-port'

// сделать геттер на принтеры по id
export default class Equipment {
  constructor(ipAddress, port) {
    this.ipAddress = ipAddress
    this.port = port
  }

  start() {
    return new Promise(async (resolve, reject) => {
      let ping = await tcpPingPort(this.ipAddress, parseInt(this.port))
      if (ping.online !== true) {
        reject('Не удалось получить доступ к удаленному оборудованию');
        return;
      }
      this.connection = new net.createConnection(this.port, this.ipAddress)
      this.connection.on('connect', () => {
        this.isStarted = true
        console.log(`Подключение выполнить удалось: ${this.ipAddress}:${this.port}`)
        resolve()
      })
      this.socket.on('error', (error) => {
        console.log(`Произошла ошибка: ${error}`)
        reject(`Произошла ошибка (${this.ipAddress}:${this.port}): ${error}`)
      })
      this.socket.on('close', (hadError) => {
        if (hadError) {
          console.log(`Соединение закрыто с ошибкой`)
          reject(`Произошла ошибка закрытия сокета (${this.ipAddress}:${this.port})`)
        } else {
          console.log(`Соединение закрыто`)
        }
      })
    })
  }
  
  stop() {
    if (this.connection) {
      try {
        this.connection.end()
        this.connection.destroy()
        this.isStarted = false
        return true
      } catch(error) {
        console.log(error)
        return false
      }
    }
  }

  write(data) {
    try {
      this.connection.write(data)
      return true
    } catch(error) {
      console.log(error)
      return false
    }
  }

  check() {
    return this.isStarted
  }
}