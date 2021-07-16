const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs')
const CbProAPI = require('./CbProAPI');
const orderTypes = require('./orderTypes');
const accountSchema = require('./accountSchema.js');
const balanceSchema = require('./balanceSchema');
const orderlistSchema = require('./orderlistSchema');



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

    try {
        // encrypt password
        signUpData.password = await bcrypt.hash(signUpData.password, 10);

        // create new document in Accounts, Balances, Orderlists
        await (new Accounts(signUpData)).save();
        await new Balances({ 
            email: signUpData.email,
            cash: 0,
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

    let result = { invalid: undefined };

    let account = await findAccount(orderData.email);
    
    // validation
    if (buy) {
        if ((orderData.orderPrice * orderAmount) > account.balance.cash)
            result.invalid = 'Insufficient cash.';
    }
    else { // sell and/or short
        if ((orderData.orderPrice * (orderAmount - account.balance.BTC)) > account.balance.cash)
            result.invalid = 'Insufficient cash.';
    }

    // load current price
    const currentPrice = await CbProAPI.loadNewPrice();

    // market order
    if (orderData.orderType === orderTypes.MARKET_ORDER) {
        orderData.orderPrice = currentPrice;
        if (buy)
            orderData.time = await buy(orderData);
        else {
            // sell if user has any BTC
            if (account.balance.BTC)
                orderData.time = await sell(orderData);

            // and/or short if user doens't have enough/any BTC to sell
            if ((orderData.orderAmount - account.balance.BTC) > 0) {

                // adjust orderData for short
                orderData.orderAmount -= account.balance.BTC;
                orderData.leverage *= account.balance.BTC;

                orderData.time = await short(orderData);
            }
        }
        await recordOrder(orderData);
        console.log(orderData) // DEBUG
    }
    // limit order
    else if (orderData.orderType === orderTypes.LIMIT_ORDER) {
        // buy
        if (buy) {
            if (currentPrice <= orderData.orderPrice) { // immediate proccess
                orderData.orderPrice = currentPrice;
                orderData.time = await buy(orderData);
                await recordOrder(orderData);
                console.log(orderData) // DEBUG
            }
            else { // list order for pending
                await postOrder(orderData);
            }
        }
        else {
            if (account.balance.BTC) {
                if (currentPrice >= orderData.orderPrice) {
                    orderData.orderPrice = currentPrice;
                    orderData.time = await sell(orderData);
                    await recordOrder(orderData);
                    console.log(orderData) // DEBUG
                }
                else {
                    await postOrder(orderData);
                }
            }
            if ((orderData.orderAmount - account.balance.BTC) > 0) {
                
                orderData.orderPrice = currentPrice;

                orderData.orderAmount -= account.balance.BTC;
                orderData.leverage *= account.balance.BTC;

                if (currentPrice >= orderData.orderPrice) {
                    orderData.time = await short(orderData);
                    await recordOrder(orderData);
                    console.log(orderData) // DEBUG
                }
                else {
                    await postOrder(orderData);
                }
            }
        }
    }
    // stop market
    else if (orderData.orderType === orderTypes.STOP_MARKET) {
        if (buy) {
            if (currentPrice >= orderData.orderPrice) {
                orderData.orderPrice = currentPrice;
                orderData.time = await buy(orderData);
                await recordOrder(orderData);
                console.log(orderData) // DEBUG
            }
            else {
                await postOrder(orderData);
            }
        }
        else {
            if (account.balance.BTC) {
                if (currentPrice <= orderData.orderPrice) {
                    orderData.orderPrice = currentPrice;
                    orderData.time = await sell(orderData);
                    await recordOrder(orderData);
                    console.log(orderData) // DEBUG
                }
                else {
                    await postOrder(orderData);
                }
            }
            if ((orderData.orderAmount - account.balance.BTC) > 0) {
                
                orderData.orderPrice = currentPrice;

                orderData.orderAmount -= account.balance.BTC;
                orderData.leverage *= account.balance.BTC;

                if (currentPrice <= orderData.orderPrice) {
                    orderData.time = await sell(orderData);
                    await recordOrder(orderData);
                    console.log(orderData) // DEBUG
                }
                else {
                    await postOrder(orderData);
                }
            }
        }
    }
}

async function findAccount(email) {
    
    return await Accounts.findOne({ email: email }).lean().exec();
}

// immediately buy and return date processed
async function buy(orderData) {

}

async function sell(orderData) {
    
}

async function short(orderData) {
    
}

async function postOrder(orderData) {
    
}

async function recordOrder(orderData) {
    
}
