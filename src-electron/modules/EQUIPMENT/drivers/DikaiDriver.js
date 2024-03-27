import TCPIPEquipment from './TCPIPEquipment.js'

export default class DikaiDriver extends TCPIPEquipment {
	constructor(ipAddress, port) {
		super(ipAddress, port)
	}
}
