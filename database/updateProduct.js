const mongoose = require('mongoose');

const updatedproductSchema = ({
    userId : String,
    productName : String,
    productCategory : String,
    productCompany : String,
    productPrice : String
})

module.exports = mongoose.model('products',productSchema)