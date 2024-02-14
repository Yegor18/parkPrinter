import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'
import Driver from './Driver.js'

class Printer extends Model { }

Printer.init({
	name: DataTypes.STRING,
	driver_id: DataTypes.INTEGER,
	ipAddress: DataTypes.STRING,
	port: DataTypes.STRING,
  is_active: DataTypes.BOOLEAN
}, {
	sequelize,
	modelName: 'Printer',
	timestamps: false
})

Printer.belongsTo(Driver, { foreignKey: 'driver_id' })

export default Printer