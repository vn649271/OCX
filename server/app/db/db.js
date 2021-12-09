const Sequalize = require("sequelize")
const db = {}
const sequelize = new Sequalize("newdb", "root", "", {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: false
    }
}) 
db.sequelize = sequelize
db.Sequalize = Sequalize

module.exports = db