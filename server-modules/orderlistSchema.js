const mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = new Schema({
    email: String,
    history: [{
        buy: Boolean,
        orderType: String,
        orderPrice: Number,
        orderAmount: Number,
        orderTime: Date
    }]
});
