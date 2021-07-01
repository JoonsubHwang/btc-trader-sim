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
        },

        findAccount: async (email) => {
            try {
                // TODO: apply hashing
                return await Accounts.findOne({ email: email }).lean().exec();
            } catch (err) {
                console.error('[data-service] Failed to find the account. ' + err);
                throw new Error('Failed to find the account.');
            }
        },

        validateSignIn: async (signInData) => {

            let incorrect = {};

            if (signInData.email) {

                const account = await findAccount(signInData.email);

                if (account) {
                    // TODO: apply hashing
                    if (account.password === signInData.password)
                        return; // only successful sign in
                    else
                        incorrect.password = 'Password is incorrect.';
                }
                else
                    incorrect.email = 'Account does not exist.';

            }
            else 
                incorrect.email = 'Please enter the email.';

            if (!signInData.password)
                incorrect.password = 'Please enter the password';

            return incorrect;
        }

    }
}

