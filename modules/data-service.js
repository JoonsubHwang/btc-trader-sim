const mongoose = require('mongoose');
const accountSchema = require('./accountSchema.js');
require('dotenv').config();



let Accounts;


exports.connectToDB = async () => {

    let db = mongoose.createConnection(process.env.CONN_STR, { useNewUrlParser: true, useUnifiedTopology: true });

    db.on('error', err => {
        console.error('[data-service] Failed to connect to the database. ' + err);
        throw new Error('Failed to connect to the database.');
    });
    
    db.once('open', () => {
        Accounts = db.model('accounts', accountSchema);
        return;
    });
};

exports.validateSignIn = async (signInData) => {

    let result = { invalid: {} };

    try {

        if (signInData.email) { // TODO: apply hashing

            result.account = await Accounts.findOne({ email: signInData.email }).lean().exec();

            if (result.account) {
                if (result.account.password == signInData.password) // TODO: apply hashing
                    result.invalid = undefined;
                else
                    result.invalid.password = 'Password is incorrect.';
            }
            else
                result.invalid.email = 'Account does not exist.';
        }
        else 
            result.invalid.email = 'Please enter the email.';

    } catch (err) {
        console.error('[data-service] Failed to validate sign in data. ' + err);
        throw new Error('Failed to validate sign in data.');
    }

    if (!signInData.password)
        result.invalid.password = 'Please enter the password';

    return result;
};

