require('dotenv').config()

const connectionStr = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@btctradersimdb.xwwve.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;