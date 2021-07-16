const mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = new Schema({
    email: String,
    cash: Number,
    BTC: Number
});
