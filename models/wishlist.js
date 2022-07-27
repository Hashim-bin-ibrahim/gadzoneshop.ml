const mongoose = require('mongoose');
const product = require('./product');
require('../config/connection')


const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  wishedItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

      date : Date,

      wished : {
          type : Boolean,
          default : false
      }

    }
  ],

 
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'vendor',

  },

}, { timestamps: true })

module.exports = mongoose.model("Wishlist", wishlistSchema)



