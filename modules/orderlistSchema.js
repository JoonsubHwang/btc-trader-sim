const mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = new Schema({
    email: String,
    pendings: [{
        type: String,
        price: Number,
        amount: Number
    }],
    history: [{
        type: String,
        price: Number,
        amount: Number
    }]
});
