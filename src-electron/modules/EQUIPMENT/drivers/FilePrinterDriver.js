import Equipment from './Equipment.js'
import fs from 'fs'

export default class FilePrinterDriver extends Equipment {
  constructor(ipAddress, port) {
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
    let str = `Код: ${data.code}, Дата: ${data.date}, Продукт: ${data.product}\n`
    fs.appendFile('C:\\Users\\mixai\\Downloads\\ТЕСТОВЫЕ ИСТОЧНИКИ ДАННЫХ\\forWriting.txt', str, (error) => {
			if (error) {
				console.log(error)
			}
    })
  }
}