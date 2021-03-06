const express = require('express');
const path = require('path');
const sessions = require('client-sessions');
const dataService = require('../server-modules/data-service');



const app = express();
const HTTP_PORT = process.env.PORT || 8080;



// middlewares

app.use(express.static(path.join(__dirname + '/../build'))); // public folder
app.use(express.json()); // json parser

app.use(sessions({
    cookieName: "session", // key name added to requests
    secret: process.env.SESS_SECRET,
    duration: 15 * (60 * 1000),
    activeDuration: 5 * (60 * 1000) // time extended by each request
}));

// passes error if not signed in
ensureSignIn = (req, res, next) => {
    if (req.session.user)
        next();
    else 
        next(new Error('Client is not signed in.'));
}



// routes

app.post('/sign-in', (req, res) => {

    const signInData = req.body;

    dataService.validateSignIn(signInData)
    .then(result => {
        if (result.invalid)
            res.send({ invalid: result.invalid });
        else {
            signIn(req, result.account);
            res.send({ email: result.account.email, name: result.account.name });
        }
    })
    .catch(err => {
        console.error('[server] Failed to sign in. ' + err);
        res.status(500).send({ error: 'Server had a problem signing in.' });
    });

});

app.post('/sign-out', ensureSignIn, (req, res) => {
    try {
        signOut(req);
        res.send();
    } catch (err) {
        console.error('[server] Failed to sign out. ' + err);
        res.status(500).send({ error: 'Server failed to sign out.' });
    }
});

app.post('/sign-up', (req, res) => {

    const signUpData = req.body;

    dataService.validateSignUp(signUpData)
    .then(invalid => {
        if (invalid)
            res.send({ invalid: invalid });
        else {
            dataService.createAccount(signUpData)
            .then(() => {
                signIn(req, signUpData);
                res.send({ email: signUpData.email, name: signUpData.name });
            })
            .catch(err => {
                throw new Error('[server] Error creating account. ' + err);
            });
        }
    })
    .catch(err => {
        console.error('[server] Error signing up. ' + err);
        res.send({ error: 'Server had a problem signing up.' });
    });
});

app.get('/sign-in-data', (req, res) => {
    if (req.session.user)
        res.send({ email: req.session.user.email, name: req.session.user.name });
    else
        res.status(204).send();
});

app.post('/account-updates', ensureSignIn, (req, res) => {
    
    const cashOld = req.body.cash;
    const email = req.session.user.email;

    dataService.loadBalance(email)
    .then(balance => {
        // if there's a change
        if (balance.cash !== cashOld)
            dataService.loadOrderHistory(email)
            .then(orderHistory => {
                res.send({
                    balance: balance,
                    orderHistory: orderHistory
                });
            });
        // if there's no change
        else
            res.status(204).send();
    })
    .catch(err => {
        console.error('[server] Failed to load account updates. ' + err);
        res.status(500).send({ error: 'Server had a problem loading account updates.' });
    });
});

app.post('/order', (req, res) => {

    let orderData = req.body;
    orderData.email = req.session.user.email;
    orderData.orderPrice = new Number(orderData.orderPrice);
    orderData.orderAmount = new Number(orderData.orderAmount);

    dataService.processOrder(orderData)
    .then(invalid => {
        if (invalid)
            res.send({ invalid: invalid});
        else
            res.send({});
    })
    .catch(err => {
        console.error('[server] Error processing order. ' + err);
        res.send({ error: 'Server had a problem processing order.' });
    });
});

app.use((req, res) => { // rest of GET routes handled by React
    res.sendFile(path.join(__dirname + '/../build/index.html'));
});



// error handler
app.use((err, req, res, next) => {
    if (err) {
        console.error('[server] Error: ' + err.message);
        res.status(500).send({ error: 'Server had an error processing the request.' });
    }
    else
        next();
});





// helpers

function signIn(req, account) {
    req.session.user = {
        email: account.email,
        name: account.name
    };
}

function signOut(req) {
    req.session.user = undefined;
}




// server start

dataService.connectToDB()
.then(() => {
    console.log('Connected to database.');
    app.listen(HTTP_PORT, () => {
        console.log('Listening on port: ' + HTTP_PORT);
    });
})
.catch(err => {
    console.error('[server] Failed to connect to the database. ' + err);
});
