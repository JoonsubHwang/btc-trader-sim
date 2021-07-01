const express = require('express');
const path = require('path');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;



// middlewares

app.use(express.static(path.join(__dirname + '/../build')));

app.use(express.json()); // json parser

app.use((req, res) => {
    res.sendFile(path.join(__dirname + '/../build/index.html'));
});




// on server start

app.listen(HTTP_PORT, () => {
    console.log('listening on port: ' + HTTP_PORT);
});
