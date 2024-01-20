const mongoose = require('mongoose');

const ImageSchema = ({
    filename: String,
    path: String,
    originalname: String,
     img:
    {
        data: Buffer,
        contentType: String
    }
})

module.exports = mongoose.model('uploads',ImageSchema)