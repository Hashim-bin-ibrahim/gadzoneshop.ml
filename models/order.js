



const mongoose = require("mongoose");
// A
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    address: Object,
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cart',
  
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    products: Object,
    
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled", "refund"],
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["COD", "Online-Payment"],
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);