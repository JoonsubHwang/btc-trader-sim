const mongoose = require('mongoose');
let Schema = mongoose.Schema;

accountSchema = new Schema({
    email: String,
    password: String
});

module.exports = accountSchema;