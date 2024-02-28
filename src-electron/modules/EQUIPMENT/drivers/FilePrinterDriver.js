import Equipment from './Equipment.js'
import fs from 'fs'

export default class FilePrinterDriver extends Equipment {
  constructor(ipAddress, port, pathToFile) {
    this.pathToFile = pathToFile
    super(ipAddress, port)
  }

  start() {
    return true
  }

  stop() {
    return true
  }

  check() {
    return true
  }

  write(data) {
    for (let row of data) {
      let str = `Код: ${row.code}, Дата: ${row.date}, Продукт: ${row.product}\n`
      fs.appendFile(this.pathToFile, str, (error) => {
        if (error) {
          console.log(error)
        }
      })
    }
  }
}