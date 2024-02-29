import fs from 'fs'

export default class FilePrinterDriver {
  constructor(pathToFile) {
    this.pathToFile = pathToFile
    this.isStarted = false
  }

  start() {
    this.isStarted = true
    return true
  }

  stop() {
    this.isStarted = false
    return true
  }

  check() {
    return this.isStarted
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