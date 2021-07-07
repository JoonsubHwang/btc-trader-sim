const express = require('express');
const path = require('path');
const sessions = require('client-sessions');
const dataService = require('../modules/data-service');



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



// routes

app.post('/sign-in', (req, res) => {

    const signInData = req.body;
    dataService.validateSignIn(signInData)
    .then(result => {
        if (result.invalid)
            res.send({ invalid: result.invalid });
        else {
            signIn(req, result.account);
            res.send({ email: result.account.email });
        }
    })
    .catch(err => {
        console.error('[server] Failed to sign in. ' + err);
        res.status(500).send({ error: 'Server had a problem signing in.' });
    });

});

app.post('/sign-out', (req, res) => {
    try {
        signOut(req);
        res.send();
    } catch (err) {
        console.error('[server] Failed to sign out. ' + err);
        res.status(500).send({ error: 'Server had a problem signing out.' });
    }
});

app.post('/account-updates', (req, res) => {
    
    const cashOld = req.body.cash;
    const email = req.session.user.email;

    dataService.loadBalance(email)
    .then(balance => {
        // if there's a change
        if (balance.cash !== cashOld)
            dataService.loadOrderlist(email)
            .then(orderlist => {
                res.send({
                    balance: balance,
                    orderlist: orderlist
                });
            });
        // if there's no change
        else
            res.send();
    })
    .catch(err => {
        console.error('[server] Failed to load account updates. ' + err);
        res.status(500).send({ error: 'Server had a problem loading account updates.' });
    });
});

app.use((req, res) => { // all GET routes handled by React
    res.sendFile(path.join(__dirname + '/../build/index.html'));
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
