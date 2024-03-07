import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'
import TypeOfDataSource from './TypeOfDataSource.js'

class DataSource extends Model { }

DataSource.init({
	name: DataTypes.STRING,
	type_id: DataTypes.INTEGER,
	config: DataTypes.STRING(1000)
}, {
	sequelize,
	modelName: 'DataSource',
	timestamps: false,
	tableName: 'dataSources'
})

DataSource.belongsTo(TypeOfDataSource, { foreignKey: 'type_id' })

export default DataSource