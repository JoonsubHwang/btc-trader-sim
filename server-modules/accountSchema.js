const mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = new Schema({
    name: String,
    email: String,
    password: String
});
