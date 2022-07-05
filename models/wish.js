const mongoose = require('mongoose');
const product = require('./product');
require ('../config/connection')


const wishSchema = new mongoose.Schema({
  user :{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  wishItems: [
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

module.exports = mongoose.model("Cart",wishSchema)



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