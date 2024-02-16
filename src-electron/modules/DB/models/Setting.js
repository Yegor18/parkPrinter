import sequelize from '../connectionToDB.js'
import { Model, DataTypes } from 'sequelize'

class Setting extends Model { }

Setting.init({
	name: DataTypes.STRING,
	value: DataTypes.STRING
}, {
	sequelize,
	modelName: 'Setting',
	timestamps: false,
	tableName: 'settings'
})

export default Setting