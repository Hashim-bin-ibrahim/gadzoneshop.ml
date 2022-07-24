const mongoose = require('mongoose');

require ('../config/connection')

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    phoneNumber : Number,
    canLogin : {
        type : Boolean,
        default : true
    },
    address: [
        {

            firstname: String,
            lastname: String,
            country: String,
            address1: String,
            address2: String,
            city: String,
            state: String,
            zip: String,
            phoneNumber: Number,
            email: String,
        }
    ],

})

module.exports = mongoose.model("User",userSchema)