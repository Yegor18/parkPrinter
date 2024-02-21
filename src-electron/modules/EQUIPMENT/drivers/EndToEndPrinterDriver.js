import Equipment from './Equipment.js'

export default class EndToEndPrinterDriver extends Equipment {
  constructor(ipAddress, port) {
    super(ipAddress, port)
  }
}