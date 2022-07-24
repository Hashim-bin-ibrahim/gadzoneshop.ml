const mongoose = require('mongoose');
const product = require('./product');
require ('../config/connection')


const wishListSchema = new mongoose.Schema({
  user :{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  cartItems: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, default: 1 },
                //price: { type: Number, required: true }
            }
        ],
  vendor:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendor',
    
  },
  
},{ timestamps: true })

module.exports = mongoose.model("WishList",wishListSchema)



