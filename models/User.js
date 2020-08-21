const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcryptjs = require('bcryptjs');


const userSchema = new Schema({
    email:
    {
        type: String,
        required: true
    },
    firstName:
    {
        type: String,
        required: true
    },
    lastName:
    {
        type: String,
        required: true
    },
    pwd:
    {
        type: String,
        required: true
    },
    dob:
    {
        type: Date,
        default: Date.now()
    }
});

// The "pre" mongoose function is going to call the below function right before the document is saved to the DB
userSchema.pre("save", function(next){
    bcryptjs.genSalt(10)
    .then(salt=>{
        bcryptjs.hash(this.pwd, salt)
        .then(hash=>{
            this.pwd = hash
            // The below code us a call back function that does the following:
            // It forces the code of execution to move onto the next code in the execution queue
            next();
        })
    })
})

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;    