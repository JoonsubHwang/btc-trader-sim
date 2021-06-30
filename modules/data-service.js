const mongoose = require('mongoose');
const accountSchema = require('./accountSchema.js');

module.exports = (connStr) => {

    let Accounts;

    return {

        initialize: async () => {
            let db = mongoose.createConnection(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
            db.on('error', () => {
                throw new Error('[data-service] Failed to connect to the database');
            });
            db.once('open', () => {
                Accounts = db.model('Accounts', accountSchema);
                return;
            })
        } 
           
    }
}

