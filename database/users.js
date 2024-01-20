const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    userName:String,
    email: String,
    password: String,
    filename: String,
    path: String,
    originalname: String
})
module.exports =mongoose.model('users',userSchema);