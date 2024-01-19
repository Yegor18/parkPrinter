import { DataTypes, Sequelize } from 'sequelize'

class DB {
  constructor() {
    this.connection = new Sequelize({
      dialect: 'sqlite',
      storage: 'C:/Users/пользователь/Documents/DEVELOPMENT/БД/test.db'
    })
    try {
      this.connection.authenticate()
      console.info('Connection to DB is successfull')
    } catch (error) {
      console.error('Error connection to DB')
      throw new Error('Config check DB not pass')
    }
    this.record = this.connection.define(
      'Record',
      {
        first_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false
        },
        text: {
          type: DataTypes.TEXT,
          allowNull: false
        }
      },
      {
        timestamps: false
      }
    )
  }

  async createRecord(record) {
    try {
      await this.record.create({
        first_name: record.firstName,
        last_name: record.lastName,
        email: record.email,
        text: record.text
      }).then('Record is entered in DB')
    } catch (error) {
      console.log(error)
    }
  }
}

export default new DB