import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'

class Driver extends Model { }

Driver.init({
	name: DataTypes.STRING
}, {
	sequelize,
	modelName: 'Driver',
	timestamps: false
})

export default Driver