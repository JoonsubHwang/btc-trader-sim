const mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = new Schema({
    email: String,
    pendings: [{
        buy: Boolean,
        type: String,
        price: Number,
        amount: Number
    }],
    history: [{
        buy: Boolean,
        type: String,
        price: Number,
        amount: Number
    }]
});
