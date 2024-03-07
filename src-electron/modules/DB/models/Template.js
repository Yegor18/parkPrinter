import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'

class Template extends Model { }

Template.init({
	name: DataTypes.STRING,
	template: DataTypes.STRING(5000)
}, {
	sequelize,
	modelName: 'Template',
	timestamps: false,
	tableName: 'templates'
})

export default Template