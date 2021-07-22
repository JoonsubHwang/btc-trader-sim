const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs')
const accountSchema = require('./accountSchema');
const balanceSchema = require('./balanceSchema');
const orderlistSchema = require('./orderlistSchema');
const CbProAPI = require('./CbProAPI');



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

        if (signInData.email) {

            result.account = await findAccount(signInData.email);

            if (result.account) {
                // email and password matched: success
                if (bcrypt.compare(signInData.password, result.account.password))
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

    let invalid = {};

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
            else if (await findAccount(signUpData.email))
                invalid.email = 'Account with this email already exists.';
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

        // if successfully validated
        if (!invalid.name && !invalid.email && !invalid.password)
            invalid = undefined;

        return invalid;

    } catch (err) {
        console.error('[data-service] Failed to validate sign up data. ' + err);
        throw new Error('Failed to validate sign up data.');
    }
};

exports.createAccount= async (signUpData) => {

    const initCash = 10000;

    try {
        // encrypt password
        signUpData.password = await bcrypt.hash(signUpData.password, 10);

        // create new document in Accounts, Balances, Orderlists
        await (new Accounts(signUpData)).save();
        await new Balances({ 
            email: signUpData.email,
            cash: initCash,
            BTC: 0
        }).save();
        await new Orderlists({ 
            email: signUpData.email,
            pendings: [],
            history: []
        }).save();
        
        console.log('[data-service] Created a new account: ' + signUpData.email);

        return;
    } 
    catch (err) {
        console.error('[data-service] Failed to create a new account. ' + err);
        throw new Error('Failed to create a new account. ' + err);
    }
}

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

exports.processOrder = async (orderData) => {

    try {

        let invalid;
    
        let balance = await exports.loadBalance(orderData.email);
        
        // validation
        if (orderData.orderAmount < 0.001)
            invalid = 'Invalid order amount.';
        else {
            if (orderData.buy) { // buy
                if ((orderData.orderPrice * orderData.orderAmount) > balance.cash)
                    invalid = 'Insufficient cash in balance.';
            }
            else { // sell
                if (orderData.orderAmount > balance.BTC)
                    invalid = 'Insufficient BTC in balance.';
            }
        }

        if (invalid)
            return invalid;
        else {
    
            // load current price
            const currentPrice = await CbProAPI.loadNewPrice();
            // set order price to current price
            orderData.orderPrice = currentPrice;
        
            // buy or sell
            // NOTE: orderType is ignored
            if (orderData.buy)
                await buy(orderData);
                
            else {
                await sell(orderData);
            }

            return;
        }
    }
    catch (err) {
        console.error('[data-service] Error while processing order. (' + err.message + ')');
        throw new Error('Failed to process order.');
    }
}

async function findAccount(email) {
    
    return await Accounts.findOne({ email: email }).lean().exec();
}

// immediate process
async function buy(orderData) {
    // pay cash and buy BTC
    await updateBalance(orderData.email, -(orderData.orderPrice * orderData.orderAmount), orderData.orderAmount);
    // record order
    await recordOrder(orderData);
}

async function sell(orderData) {
    // pay BTC and buy cash
    await updateBalance(orderData.email, (orderData.orderPrice * orderData.orderAmount), -orderData.orderAmount);
    // record order
    await recordOrder(orderData);
}

// updates user's balance
async function updateBalance(email, updateCash, updateBTC) {
    await Balances.updateOne(
        { email: email },
        { $inc: {
            cash: updateCash,
            BTC: updateBTC
        }}
    );
}

// add order to order history
async function recordOrder(orderData) {
    
    let record = {
        buy: orderData.buy,
        orderType: orderData.orderType,
        orderPrice: orderData.orderPrice,
        orderAmount: orderData.orderAmount,
        orderTime: new Date()
    }

    let orderList = await Orderlists.findOne({ email: orderData.email }).lean().exec();
    orderList.history += record;
    orderList.save();
}
