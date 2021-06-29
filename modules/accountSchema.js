const mongoose = require('mongoose');
let Schema = mongoose.Schema;

module.exports = accountSchema = new Schema({
    email: String,
    password: String
});
