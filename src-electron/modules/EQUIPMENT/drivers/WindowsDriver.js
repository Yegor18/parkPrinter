import Equipment from './Equipment.js'

export default class WindowsDriver extends Equipment {
  constructor(ipAddress, port) {
    super(ipAddress, port)
  }
}