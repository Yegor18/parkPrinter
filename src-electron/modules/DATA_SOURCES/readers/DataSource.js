import equipmentManager from "app/src-electron/modules/EQUIPMENT/EquipmentManager";

export default class DataSource {

	static setDataForSending(dataSourceId, data) {
		equipmentManager.distributeData(dataSourceId, data)
	}
	// constructor(onStarted, onStopped) {
	// 	this.isStarted = false
	// 	this.onStarted = onStarted
	// 	this.onStopped = onStopped
	// }
	//
	// start() {
	// 	this.isStarted = true
	// 	this.onStarted()
	// }
	//
	// stop() {
	// 	this.isStarted = false
	// 	this.onStopped()
	// }

}
