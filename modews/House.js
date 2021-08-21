const { Schema, model } = require('mongoose');

const schema = new Schema({
    name: { type: String },
    type: { type: String },
    year: { type: Number },
    city: { type: String },
    imageUrl: { type: String },
    description: { type: String },
    pieces: { type: Number },
    users: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' }
});


module.exports = model('House', schema);