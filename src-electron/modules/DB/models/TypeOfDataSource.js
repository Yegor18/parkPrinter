import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'

class TypeOfDataSource extends Model { }

TypeOfDataSource.init({
	name: DataTypes.STRING
}, {
	sequelize,
	modelName: 'TypeOfDataSource',
	timestamps: false,
	tableName: 'typesOfDataSources'
})

export default TypeOfDataSource