const mongoose = require('mongoose');
const accountSchema = require('./accountSchema.js');

const connStr = '';
let Accounts;



exports.connect = async () => {
    let db = mongoose.createConnection(connStr, { useNewUrlParser: true, useUnifiedTopology: true });
    db.on('error', () => {
        throw new Error('[data-service] Failed to connect to the database');
    });
    db.once('open', () => {
        Accounts = db.model('Accounts', accountSchema);
        return;
    })
},

exports.findAccount = async (email) => {
    try {
        // TODO: apply hashing
        return await Accounts.findOne({ email: email }).lean().exec();
    } catch (err) {
        console.error('[data-service] Failed to find the account. ' + err);
        throw new Error('Failed to find the account.');
    }
},

exports.validateSignIn = async (signInData) => {

    let invalid = {};

    try {

        if (signInData.email) { // TODO: apply hashing

            const account = await Accounts.findOne({ email: email }).lean().exec();

            if (account) {
                if (account.password === signInData.password) // TODO: apply hashing
                    return undefined; // only successful sign in
                else
                    invalid.password = 'Password is incorrect.';
            }
            else
                invalid.email = 'Account does not exist.';

        }
        else 
            invalid.email = 'Please enter the email.';

    } catch (err) {
        console.error('[data-service] Failed to validate sign in data. ' + err);
        throw new Error('Failed to validate sign in data.');
    }

    if (!signInData.password)
        invalid.password = 'Please enter the password';

    return invalid;
}

