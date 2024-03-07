import { Sequelize } from 'sequelize'

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './databases/db.db'
})

try {
	sequelize.authenticate()
	console.info('Connection to DB is successfull')
} catch (error) {
	console.error('Error connection to DB')
	throw new Error('Config check DB not pass')
}

export default sequelize