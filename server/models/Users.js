const Sequalize = require("sequelize")
const db = require("../db/db")

module.exports = db.sequelize.define(
    'users',
    {
        id: {
            type: Sequalize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: Sequalize.STRING
        },
        last_name: {
            type: Sequalize.STRING

        },
        email: {
            type: Sequalize.STRING
        },
        password: {
            type: Sequalize.STRING
        },
        token: {
            type: Sequalize.STRING
        },
        country: {
            type: Sequalize.STRING
        },
        status: {
            type: Sequalize.INTEGER
        }
    }
)