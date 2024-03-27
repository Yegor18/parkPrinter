import TCPIPEquipment from './TCPIPEquipment.js'

export default class LogopackDriver extends TCPIPEquipment {
	constructor(ipAddress, port) {
		super(ipAddress, port)
	}
}
