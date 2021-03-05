const express = require('express');
const path = require('path');

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.use((req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(HTTP_PORT, () => {
    console.log('listening on port: ' + HTTP_PORT);
});
