import Equipment from './Equipment.js'

export default class FilePrinterDriver extends Equipment {
  constructor(ipAddress, port) {
    super(ipAddress, port)
  }
}