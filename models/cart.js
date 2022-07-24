const mongoose = require('mongoose');
const product = require('./product');
require('../config/connection')


const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  cartItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },

      placed: {
        type: Boolean,
        default: 'true',
        
      },
      packed: {
        type: Boolean,
        default: 'false',
        
      },
      shipped: {
        type: Boolean,
        default: 'false',
        
      },
      delivered: {
        type: Boolean,
        default: 'false',
        
      },
      cancelled: {
        type: Boolean,
        default: 'false',
        
      },
      orderStatus: {
        type: String,
        default: "order Placed"
      },
      date : Date

    }
  ],
  status : String,
 
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendor',

  },

}, { timestamps: true })

module.exports = mongoose.model("Cart", cartSchema)



// const mongoose = require('mongoose');

// const cartSchema = new mongoose.Schema({
//     customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     cartItems: [
//         {
//             product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//             quantity: { type: Number, default: 1 },
//             //price: { type: Number, required: true }
//         }
//     ]
// }, );


// module.exports = mongoose.model('Cart', cartSchema);