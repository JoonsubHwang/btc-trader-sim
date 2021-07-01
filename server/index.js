const express = require('express');
const path = require('path');
const dataService = require('../modules/data-service');



const app = express();
const HTTP_PORT = process.env.PORT || 8080;



// middlewares

app.use(express.static(path.join(__dirname + '/../build'))); // public folder
app.use(express.json()); // json parser




// routes

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../build/index.html'));
});

app.post('/sign-in', (req, res) => {

    const signInData = req.body;
    dataService.validateSignIn(signInData)
        .then(invalid => {
            if (invalid)
                res.send(invalid);
            else {
                signIn(signInData.email);
                res.redirect('back');
            }
        })
        .catch(err => {
            console.error('[server] Failed to sign in. ' + err);
            res.send({ error: 'Server had a problem signing in.' });
        });

});





// helpers

function signIn(email) {
    // TODO: save email to session
    console.log('[debug]: Signed in with ' + email);
}




// server start

dataService.connect().then(() => {
    console.log('Connected to database.')
    app.listen(HTTP_PORT, () => {
        console.log('Listening on port: ' + HTTP_PORT);
    });
});
