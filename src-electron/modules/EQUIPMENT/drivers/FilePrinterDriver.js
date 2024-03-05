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
      fs.appendFile(this.pathToFile, row, (error) => {
        if (error) {
          console.log(error)
        }
      })
    }
  }
}