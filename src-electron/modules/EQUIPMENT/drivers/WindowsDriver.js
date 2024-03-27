import TCPIPEquipment from './TCPIPEquipment.js'

export default class WindowsDriver extends TCPIPEquipment {
	constructor(ipAddress, port) {
		super(ipAddress, port)
	}
}
