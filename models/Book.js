const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    userid:
    {
        type : String,
        required : true
    },
    roomTitle:
    {
        type : String,
        required : true
    },
    price:
    {
        type : Number,
        required : true
    },
    roomid:
    {
        type : String,
        required : true
    },
    description:
    {
        type: String,
        required : true
    },
    location:
    {
        type : String,
        required : true
    },
    roomImg:
    {
        type : String
    }
});

const bookModel = mongoose.model("Book", bookSchema);
module.exports = bookModel;