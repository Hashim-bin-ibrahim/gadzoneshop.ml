var db = require('../config/connection')
const category = require('../models/category')
// const async = require('hbs/lib/async')
const user = require('../models/user')
var bcrypt = require('bcrypt')
const coupon = require('../models/coupon')
const product = require('../models/product')
const order = require('../models/order')
const cart = require('../models/cart')
// const { PhoneNumberContext } = require('twilio/lib/rest/lookups/v1/phoneNumber')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { resolve } = require('path')
const async = require('hbs/lib/async')
const { response } = require('../app')



// razorpay instance code
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

module.exports = {
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(product)
    })
  },
  userAvlCheck: (userData) => {
    return new Promise(async (resolve, reject) => {

      const exist = await user.findOne({ email: userData.email })
      if (exist) {
        var userExist = true

        resolve(userExist)
      } else {
        var userExist = false
        resolve(userExist)

      }
    })
  },
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.password = await bcrypt.hash(userData.password, 10)
      const users = user.create({ name: userData.name, email: userData.email, password: userData.password, phoneNumber: userData.phonenumber })
      resolve(users)
    })
  },
  userLogin: (userData) => {

    return new Promise(async (resolve, reject) => {

      let response = {}
      let userDetails = await user.findOne({ email: userData.email })

      if (userDetails) {
        const password = await bcrypt.compare(userData.password, userDetails.password)
        if (password) {
          response.userDetails = userDetails;
          response.status = true;

          resolve(response)
        } else {
          response.status = false;
          resolve(response)

        }
      } else {

        response.user = false;
        resolve(response)
      }
    })
  },

  addToCart: (proId, userId, qnty) => {
  
    return new Promise(async (resolve, reject) => {
      let response = {}
      let productStock = await product.findOne({_id:objectId(proId)})
         
        if(productStock.stock != 0){        
      let userCart = await cart.findOne({ user: userId })
      if (userCart) {
        let productIn = await userCart.cartItems.find(c => c.product == proId)
        
        if (productIn) {
          let productExist = await cart.updateOne
            (
              { "user": userId, "cartItems.product": proId },
              {

                "$set": { "cartItems.$.quantity": parseInt(productIn.quantity) + qnty },
              }
            )
          resolve(productExist)

        } else {

          const newCartPro = await cart.updateOne({ user: objectId(userId) },
            {
              $push: { cartItems: { product: objectId(proId), quantity: qnty } },

            }
          )
          resolve(newCartPro)
        }

      }
      else {

        let cartObj = new cart({
          user: objectId(userId),
          cartItems: [
            { product: [objectId(proId)] }
          ]

        })
        await cartObj.save().then((response) => {
          response.cartObj = cartObj

          resolve(response)
        })
      }
    }else{
      response.stockOut = true,
      console.log("stooooooooooooooooock out.......................................");
      resolve(response)
    }
    })
  },


  userAddress: (addressId, userId) => {
    return new Promise(async (resolve, reject) => {
      let address = await user.aggregate([
        {
          '$match': {
            '_id': objectId(userId)
          }
        }, {
          '$unwind': {
            'path': '$address'
          }
        }, {
          '$match': {
            'address._id': objectId(addressId)
          }
        }
      ])
      resolve(address)

    })

  },

  save_Edited_Address: (addressId, addressData) => {
    
    return new Promise(async (resolve, reject) => {
      await user.updateOne({ 'address._id': objectId(addressId) },
        {
          $set: {
            'address.$.firstname': addressData.firstname,
            'address.$.lastname': addressData.lastname,
            'address.$.country': addressData.country,
            'address.$.address1': addressData.address1,
           ' address.$.address2': addressData.address2,
            'address.$.city': addressData.city,
           ' address.$.state': addressData.state,
            'address.$.zip': addressData.zip,
            'address.$.phoneNumber': addressData.phoneNumber,
            'address.$.email': addressData.email,
          }
        }).then(() => {
          resolve()
        })

    })

  },
  showCartPro: (userId) => {

    return new Promise(async (resolve, reject) => {
      let cartPro = await cart.aggregate(
        [
          {
            '$match': {
              'user': objectId(userId)
            }
          }, {
            '$unwind': {
              'path': '$cartItems'
            }
          }, {
            '$lookup': {
              'from': 'products',
              'localField': 'cartItems.product',
              'foreignField': '_id',
              'as': 'productLookup'
            }
          }, {
            '$unwind': {
              'path': '$productLookup'
            }
          }, {
            '$lookup': {
              'from': 'categories',
              'localField': 'productLookup.category',
              'foreignField': '_id',
              'as': 'categorylookup'
            }
          }, {
            '$unwind': {
              'path': '$categorylookup'
            }
          }, {
            '$match': {
              'categorylookup.isBlocked': false
            }
          }, {
            '$lookup': {
              'from': 'vendors',
              'localField': 'productLookup.createdBy',
              'foreignField': '_id',
              'as': 'vendolookup'
            }
          }, {
            '$unwind': {
              'path': '$vendolookup'
            }
          }, {
            '$match': {
              'vendolookup.isBlocked': false
            }
          }, {
            '$addFields': {
              'total': {
                '$multiply': [
                  '$cartItems.quantity', '$productLookup.price'
                ]
              }
            }
          }, {
            '$project': {
              'cartItems': 1,
              'productLookup': 1,
              'categorylookup': 1,
              'vendolookup': 1,
              'total': 1
            }
          }
        ]
      )


      resolve(cartPro)
    })

  },
  cartSubTotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      let subTotal = await cart.aggregate([
        {
          '$match': {
            'user': objectId(userId)
          }
        }, {
          '$unwind': {
            'path': '$cartItems'
          }
        }, {
          '$lookup': {
            'from': 'products',
            'localField': 'cartItems.product',
            'foreignField': '_id',
            'as': 'productLookup'
          }
        }, {
          '$unwind': {
            'path': '$productLookup'
          }
        }, {
          '$lookup': {
            'from': 'categories',
            'localField': 'productLookup.category',
            'foreignField': '_id',
            'as': 'categorylookup'
          }
        }, {
          '$unwind': {
            'path': '$categorylookup'
          }
        }, {
          '$match': {
            'categorylookup.isBlocked': false
          }
        }, {
          '$lookup': {
            'from': 'vendors',
            'localField': 'productLookup.createdBy',
            'foreignField': '_id',
            'as': 'vendolookup'
          }
        }, {
          '$unwind': {
            'path': '$vendolookup'
          }
        }, {
          '$match': {
            'vendolookup.isBlocked': false
          }
        }, {
          '$addFields': {
            'total': {
              '$multiply': [
                '$cartItems.quantity', '$productLookup.price'
              ]
            }
          }
        }, {
          '$project': {
            'productLookup': 1,
            'categorylookup': 1,
            'vendolookup': 1,
            'total': 1
          }
        }, {
          '$group': {
            '_id': '$_id',
            'subTotal': {
              '$sum': '$total'
            }
          }
        }
      ]
      )
      resolve(subTotal)
    })
  },
  getCartCount: (userId) => {

    let count = 0;
    return new Promise(async (resolve, reject) => {

      let userCart = await cart.findOne({ user: objectId(userId) })
      if (userCart) {
        count = userCart.cartItems.length

      }
      resolve(count)
    })
  },
  //change product quantity from cart
  changeProductQuantity: (details) => {

    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)

    return new Promise(async (resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {

        await cart.updateOne({ _id: objectId(details.cart) },
          {
            $pull: { cartItems: { product: objectId(details.product) } }

          }
        ).then((response) => {

          resolve({ removeProduct: true })
        })
      } else {
        await cart.updateOne({ _id: objectId(details.cart), 'cartItems.product': objectId(details.product) },
          {
            "$set": { "cartItems.$.quantity": details.quantity + details.count }
          }).then((response) => {

            resolve(response)
          })
      }

    })

  },
  //change product quantity from product pages
  changeQuantity: (details) => {

    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)

    return new Promise(async (resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {

        await cart.updateOne({ _id: objectId(details.cart) },
          {
            $pull: { cartItems: { product: objectId(details.product) } }

          }
        ).then((response) => {

          resolve({ removeProduct: true })
        })
      } else {
        await cart.updateOne({ _id: objectId(details.cart), 'cartItems.product': objectId(details.product) },
          {
            "$set": { "cartItems.$.quantity": details.quantity + details.count }
          }).then((response) => {

            resolve(response)
          })
      }

    })

  },
  // quantityChange :(details)=>{
  //     details.quantity = parseInt(details.quantity)
  //   details.count = parseInt(details.count);
  //   console.log(details.count+"                                           ocunt");
  //   return new Promise(async(resolve,reject)=>{
  //     await product.updateOne({_id:objectId(details.productId)},
  //     {
  //       "$set":{"quantity":details.quantity+details.count }
  //     }).then((response)=>{
  //       resolve(response)
  //     })


  //   })

  // },
  quantityChange: (details) => {
    details.quantity = parseInt(details.quantity)
    details.count = parseInt(details.count);

    return new Promise(async (resolve, reject) => {

      resolve(true)

    })

  },
  productDetails: (proID) => {
    return new Promise(async (resolve, reject) => {
      let proDetils = await product.aggregate([
        {
          '$match': {
            '_id': objectId(proID)
          }
        }, {
          '$lookup': {
            'from': 'categories',
            'localField': 'category',
            'foreignField': '_id',
            'as': 'categorylookup'
          }
        }, {
          '$unwind': {
            'path': '$categorylookup'
          }
        }, {
          '$match': {
            'categorylookup.isBlocked': false
          }
        }, {
          '$lookup': {
            'from': 'vendors',
            'localField': 'createdBy',
            'foreignField': '_id',
            'as': 'vendorslookup'
          }
        }, {
          '$unwind': {
            'path': '$vendorslookup'
          }
        }, {
          '$match': {
            'vendorslookup.isBlocked': false
          }
        }
      ])

      resolve(proDetils)
      
    })

  },
  orderedItems: () => {
    return new Promise(async (resolve, reject) => {
      let proToCheck = await cart.aggregate(

      )
    })
  },




  placeOrder: async (deliveryDetails, userId, cartSum, carts, paymentMethod, grand_Total) => {
    let productQuantity = carts.cartItems[0].quantity
    let productId = carts.cartItems[0].product
    let abc =await product.findOne({_id:objectId(productId)})
    let stock = abc.stock
    let currentValue = stock-productQuantity
    console.log(currentValue,"                                      666666666666666666666666666666666666666666666");

    return new Promise(async (resolve, reject) => {
    
      const orderObj = {
        user: userId,
        cart: carts._id,
        products: carts.cartItems,
        address: deliveryDetails[0].address,
        date: new Date(),
        totalAmount: grand_Total,
        paymentType: paymentMethod,

      }

      if (paymentMethod === 'COD') {
        orderObj.paymentStatus = "completed"
      }
      if (paymentMethod === 'Online-Payment') {

        orderObj.paymentStatus = "pending"
      }

      let stockClearing  = await product.updateOne({_id:objectId(productId)},
      {
        $set:{
          stock:currentValue
        }

      })

      


      const newOrder = await order.create(orderObj)



      resolve(newOrder._id)
      await cart.remove()

    })

  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartProducts = await cart.findOne({ 'user': userId })

      resolve(cartProducts)
    })
  },

  getAddress: (addressId, userId) => {
    let response = {}
    return new Promise(async (resolve, reject) => {
      const userAddress = await user.aggregate([
        {
          $match: {
            _id: objectId(userId)
          }
        }, {
          $unwind: '$address'
        }, {
          $match: {
            'address._id': objectId(addressId)
          }
        }
      ])


      response.userAddress = userAddress
      resolve(response)

    })
  },

  generateRazorPAy: (orderId, total) => {

    return new Promise((resolve, reject) => {
      const options = {
        amount: total * 100,
        currency: 'INR',
        receipt: `${orderId}`,
      }
      instance.orders.create(options, (err, order) => {

        resolve(order)

      })

    })
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto');
      let hmac = crypto.createHmac('sha256', 'wwzC1sxu3tcGS4FJqXAwEYaH');
      hmac.update(
        `${details['payment[razorpay_order_id]']}|${details['payment[razorpay_payment_id]']}`,

      );
      hmac = hmac.digest('hex');
      if (hmac == details['payment[razorpay_signature]']) {
        resolve();
      } else {

        reject(err);
      }
    })
  },
  changePaymentStatus: (orderId) => {

    return new Promise(async (resolve, reject) => {

      await order.updateOne({ _id: objectId(orderId) },
        {
          $set: {
            orderStatus: "placed"
          }
        }).then(() => {
          resolve()
        })
    })
  },
  orderedProducts: (userId) => {
    return new Promise(async (resolve, reject) => {

      let orderPro = await order.aggregate([
        {
          '$match': {
            'user': objectId(userId)
          }
        }, {
          '$unwind': {
            'path': '$products'
          }
        }, {
          '$lookup': {
            'from': 'products', 
            'localField': 'products.product', 
            'foreignField': '_id', 
            'as': 'productLookup'
          }
        }, {
          '$unwind': {
            'path': '$productLookup'
          }
        }, {
          '$unwind': {
            'path': '$productLookup.productPictures'
          }
        }, {
          '$sort': {
            '_id': -1
          }
        }
      ])
      resolve(orderPro)
    })
  },

  saveAddress: (deliveryDetails, userId) => {

    let addressDetails = {
      firstname: deliveryDetails.firstname,
      lastname: deliveryDetails.lastname,
      country: deliveryDetails.country,
      address1: deliveryDetails.address1,
      address2: deliveryDetails.address2,
      city: deliveryDetails.city,
      state: deliveryDetails.state,
      zip: deliveryDetails.zip,
      phoneNumber: deliveryDetails.phoneNumber,
      email: deliveryDetails.email,
    }

    return new Promise(async (resolve, reject) => {
      let userAddress = await user.findOne({ '_id': userId })

      if (userAddress.address) {

        let length = userAddress.address.length
        if (userAddress && length <= 2) {
          await user.updateOne(
            { '_id': objectId(userId) },
            {
              $push: {
                address: [addressDetails],
              }
            }).then((response) => {
              resolve(response)
            })
        } else {
          let response = {}
          response.addressLimit = true
          resolve(response)
          rzp_test_T1PqEHZOGJ29HP
        }
      } else {
        let addressSpec = await user.create({ address: addressDetails })
      }

    })
  },

  deleteAddress: (addressId, userId) => {
    return new Promise(async (resolve, reject) => {
      await user.findOneAndUpdate({ _id: objectId(userId) },
        {
          $pull: {
            address: { _id: addressId }
          }
        })

      resolve()

    })

  },
  deleteAddress_myAddress: (addressId, userId) => {
    return new Promise(async (resolve, reject) => {
      await user.findOneAndUpdate({ _id: objectId(userId) },
        {
          $pull: {
            address: { _id: addressId }
          }
        })

      resolve()

    })

  },

  //   Customer.findOneAndUpdate(query, {$pull: {address: addressId}}, (err, data) => {
  //     if (err) {
  //         return res.status(500).json({ error: 'error in deleting address' });
  //     }
  //     res.json(data);   
  // });



  existAddress: (userId) => {


    return new Promise(async (resolve, reject) => {

      const addresss = await user.aggregate([
        {
          '$match': {
            '_id': objectId(userId)
          }
        }
      ])
      resolve(addresss)

    })

  },
  orderedProList: (orderedProId) => {
    return new Promise(async (resolve, reject) => {
      await product.aggregate([
        {
          '$match': {
            '_id': objectId(orderedProId)
          }
        }, {
          '$unwind': {
            'path': '$productPictures'
          }
        }, {
          '$lookup': {
            'from': 'vendors',
            'localField': 'createdBy',
            'foreignField': '_id',
            'as': 'vendorLookup'
          }
        }, {
          '$unwind': {
            'path': '$vendorLookup'
          }
        }
      ]).then((response) => {

        resolve(response)
      })

    })

  },
  orderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
       
      let orderDetails = await order.aggregate([
        {
          '$match': {
            '_id': objectId(orderId)
          }
        }, {
          '$unwind': {
            'path': '$products'
          }
        },{
          '$project': {
              '_id': 1, 
              'user': 1, 
              'products': 1, 
              'totalAmount': 1, 
              'paymentType': 1, 
              'cart': 1, 
              'address': 1, 
              createdAt: { $dateToString: { format: "%Y-%m-%d", date: '$createdAt' } }
          }
      }
      ])
     
      resolve(orderDetails)

    })

  },
  getCoupon: () => {
    return new Promise(async (resolve, reject) => {
      let availCoupon = await coupon.aggregate([
        {
          '$project': {

            couponCode: 1,
            description: 1,
            minValue: 1,
            couponType: 1,
            couponValue: 1,
            maxVAlue: 1,
            limit: 1,
            couponUsageLimit: 1,
            couponValidFrom: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidFrom' } },
            couponValidTo: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidTo' } }


          }
        }
      ])

      resolve(availCoupon)
    })
  },



  couponCheck: (couponCode, subtotal, date, userId) => {

    let response = {}

    return new Promise(async (resolve, reject) => {
      let couponDetails = await coupon.aggregate([
        {
          '$match': {
            'couponCode': couponCode
          }
        },
        {
          '$project': {
            _id: 1,
            couponCode: 1,
            description: 1,
            minValue: 1,
            couponType: 1,
            couponValue: 1,
            maxVAlue: 1,
            limit: 1,
            couponUsageLimit: 1,
            couponValidFrom: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidFrom' } },
            couponValidTo: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidTo' } }


          }
        }
      ])

      let currentDate = new Date()
      let todayDate = formatDate(currentDate)


      function formatDate(date) {
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 101).toString().substring(1);
        var day = (date.getDate() + 100).toString().substring(1);
        return year + "-" + month + "-" + day;
      }



      if (+subtotal >= +couponDetails[0].minValue && todayDate <= couponDetails[0].couponValidTo && todayDate >= couponDetails[0].couponValidFrom) {

        const newUserId = await coupon.updateOne({ _id: couponDetails._id }, {
          $push: {
            users: {
              userId: objectId(userId)
            }
          }
        })
        

        response.couponAccess = true
        resolve(response)
      } else {
        response.couponAccess = false
        resolve(response)
      }
    })
  },

  getAddressDetails: (addressId) => {
  
    return new Promise(async (resolve, reject) => {
      let address = await user.aggregate([
        {
          '$match': {
            'address._id': objectId(addressId)
          }
        }, {
          '$unwind': {
            'path': '$address'
          }
        }, {
          '$match': {
            'address._id': objectId(addressId)
          }
        }
      ])
      
      resolve(address)

    })
  },

  brandFilter : (brand_name)=>{
    return new Promise(async(resolve,reject)=>{
      await product.aggregate(
        [
          {
              '$match': {
                  'brand_name': brand_name
              }
          }
      ]
      )


    }).then((response)=>{
      resolve(response)
    })
  }



}





