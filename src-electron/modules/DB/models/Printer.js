import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'
import Driver from './Driver.js'
import DataSource from './DataSource.js'

class Printer extends Model { }

Printer.init({
	name: DataTypes.STRING,
	driver_id: DataTypes.INTEGER,
	ipAddress: DataTypes.STRING,
	port: DataTypes.STRING,
  is_active: DataTypes.BOOLEAN,
  data_source_id: DataTypes.INTEGER,
  config: DataTypes.STRING(1000)
}, {
	sequelize,
	modelName: 'Printer',
	timestamps: false,
	tableName: 'printers'
})

Printer.belongsTo(Driver, { foreignKey: 'driver_id' })
Printer.belongsTo(DataSource, { foreignKey: 'data_source_id' })

export default Printer