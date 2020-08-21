const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomTitle:
    {
        type: String,
        required: true
    },
    price:
    {
        type: Number,
        required: true
    },
    description:
    {
        type: String,
        required: true
    },
    location:
    {
        type: String,
        required: true
    },
    roomImg:
    {
        type: String
    }
});

const roomModel = mongoose.model("Room", roomSchema);

module.exports = roomModel;