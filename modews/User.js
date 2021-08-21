const { Schema, model } = require('mongoose');

const schema = new Schema({
    name: { type: String },
    username: { type: String, required: true },
    hashedPassword: { type: String, required: true }
});

module.exports = model('User', schema);