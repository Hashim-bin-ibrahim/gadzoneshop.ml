const mongoose = require('mongoose');
const { type } = require('os');
const { array } = require('../public/middleware/multer');
const CouponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    couponType: {
        type: String,
        required: true,
        trim: true
    },
    couponValue: {
        type: String,
        required: true,
        trim: true
    },
    couponValidFrom: {
        type: Date,
        required: true,
        trim: true
    },
    couponValidTo: {
        type: Date,
        required: true,
        trim: true
    },
    minValue: {
        type: String,
        required: true,
        trim: true
    },
    maxVAlue: {
        type: String,
        required: true,
        trim: true
    },
    limit: {
        type: String,
        required: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: true,
    },
    expired: {
        type: Boolean,
        default: false,
    },
    couponUsageLimit: {
        type: String,
        required: true,
        trim: true
    },


    productPictures: Array,
    users: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }

    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',

    },

    updatedAt: Date,

}, { timestamps: true });


module.exports = mongoose.model('Coupon', CouponSchema);