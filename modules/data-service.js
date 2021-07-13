const mongoose = require('mongoose');
const accountSchema = require('./accountSchema.js');
const balanceSchema = require('./balanceSchema');
const orderlistSchema = require('./orderlistSchema');
require('dotenv').config();



let Accounts, Balances, Orderlists;


exports.connectToDB = async () => {

    let db = mongoose.createConnection(process.env.CONN_STR, { useNewUrlParser: true, useUnifiedTopology: true });

    db.on('error', err => {
        console.error('[data-service] Failed to connect to the database. ' + err);
        throw new Error('Failed to connect to the database.');
    });
    
    db.once('open', () => {
        Accounts = db.model('accounts', accountSchema);
        Balances = db.model('balances', balanceSchema);
        Orderlists = db.model('orderlists', orderlistSchema);
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

exports.validateSignUp = async (signUpData) => {

    let invalid;

    try {

        // validate name
        if (signUpData.name) {
            if (!(/^\w+$/).test(signUpData.name))
                invalid.name = 'Only letters, numbers, and underscore are allowed.';
        }
        else 
            invalid.name = 'Please enter the name.';
        
        // validate email
        if (signUpData.email) {
            if (!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).test(signUpData.email))
                invalid.email = 'Email is in invalid format.';
        }
        else 
            invalid.email = 'Please enter the email.';

        // validate password
        if (signUpData.password) {
            if (!(/^(?=.{8,})/).test(signUpData.password))
                invalid.password = 'Must be at least 8 characters.';
            else if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).test(signUpData.password))
                invalid.password = 'Must contain lowercase, uppercase letter, and number.';
        }
        else 
            invalid.password = 'Please enter the password.';

        return invalid;

    } catch (err) {
        console.error('[data-service] Failed to validate sign up data. ' + err);
        throw new Error('Failed to validate sign up data.');
    }
};

exports.loadBalance = async (email) => {

    try {
        const balance = await Balances.findOne({ email: email }).lean().exec();

        if (balance)
            return balance;
        else
            throw new Error('Balance not found with email: ' + email);

    } catch (err) {
        console.error('[data-service] Failed to load balance. ' + err);
        throw new Error('Failed to load balance of ' + email);
    }
};

exports.loadOrderlist = async (email) => {

    try {
        const orderlist =  await Orderlists.findOne({ email: email }).lean().exec();

        if (orderlist)
            return orderlist;
        else
            throw new Error('Orderlist not found with email: ' + email);
        
    } catch (err) {
        console.error('[data-service] Failed to load orderlist ' + err);
        throw new Error('Failed to load orderlist of ' + email);
    }
};

