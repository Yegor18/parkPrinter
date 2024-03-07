import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'
import Driver from './Driver.js'
import DataSource from './DataSource.js'
import Template from './Template.js'

class Printer extends Model { }

Printer.init({
	name: DataTypes.STRING,
	driver_id: DataTypes.INTEGER,
	ipAddress: DataTypes.STRING,
	port: DataTypes.STRING,
	is_active: DataTypes.BOOLEAN,
	data_source_id: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	config: DataTypes.STRING(1000),
	template_id: DataTypes.INTEGER
}, {
	sequelize,
	modelName: 'Printer',
	timestamps: false,
	tableName: 'printers'
})

Printer.belongsTo(Driver, { foreignKey: 'driver_id' })
Printer.belongsTo(DataSource, { foreignKey: 'data_source_id' })
Printer.belongsTo(Template, { foreignKey: 'template_id' })

export default Printer