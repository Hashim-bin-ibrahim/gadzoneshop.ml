var db = require('../config/connection')
const category = require('../models/category')
const { resolve } = require('path')
const async = require('hbs/lib/async')
const user = require('../models/user')
var bcrypt = require('bcrypt')
const req = require('express/lib/request')
const product = require('../models/product')
const cart = require('../models/cart')
var objectId = require('mongodb').ObjectId

module.exports = {
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            var response = {}
            const exist = await user.findOne({ email: userData.email })
            if (exist) {
                console.log("user exist");

                response.userExist = true

                resolve(response)
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                let users = await user.create({ name: userData.name, email: userData.email, password: userData.password })
                response.userExist = false
                response.user = users
                resolve(response)



            }
        })
    },
    userLogin: (userData) => {
        return new Promise(async (resolve, reject) => {

            let response = {}
            let userDetails = await user.findOne({ email: userData.email })
            console.log(userDetails + "haaaiiiiiiiiiiiii");

            if (userDetails) {
                const password = await bcrypt.compare(userData.password, userDetails.password)
                if (password) {
                    response.userDetails = userDetails;
                    response.status = true;
                    console.log('user approved');
                    resolve(response)
                } else {
                    response.status = false;
                    resolve(response)

                }
            } else {
                console.log('vendor not exist');
                response.user = false;
                resolve(response)
            }
        })
    },
    addToCart: (proId, userId) => {
      
        return new Promise(async (resolve, reject) => {
            let userCart = await cart.findOne({ user: userId })
            console.log(userCart);
            if (userCart) {
                let productIn = await userCart.cartItems.find(c => c.product == proId)
                if (productIn) {
                    await cart.updateOne
                        (
                            { "user": userId, "cartItems.product": proId },
                            {
                                "$set": { "cartItems.$.quantity": productIn.quantity + 1 }
                            }
                        )
                } else {
                    console.log("product is pushing to an existing cart");
                    const newCartPro = await cart.updateOne({ user: objectId(userId) },
                        {
                            $push: { cartItems: { product: objectId(proId) } }
                        }
                    )
                    resolve(newCartPro)
                }

            }
            else {
                //user id
                // const userData = await user.findOne({ name: userId.name })
                // const objIdUser = userData._id
                let cartObj = new cart({
                    user: objectId(userId),
                    cartItems: [
                        { product: [objectId(proId)] }
                    ]

                })
                // console.log(cartObj);
                await cartObj.save().then((response) => {
                    response.cartObj = cartObj
                    console.log(response.cartObj);
                    resolve(response)
                })
            }
        })
    },

    showCartPro: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cartPro = await cart.aggregate(
                [
                    {
                      '$match': {
                        'user':  objectId(userId)
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
                        'cartItems':1,
                        'productLookup': 1, 
                        'categorylookup': 1, 
                        'vendolookup': 1, 
                        'total': 1
                      }
                    }
                  ]
                )
            console.log(cartPro);

            resolve(cartPro)
        })

    },
    cartSubTotal : (userId)=>{
        return new Promise(async (resolve, reject) => {
            let subTotal = await cart.aggregate([
                {
                  '$match': {
                    'user':  objectId(userId)
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
        console.log(userId);
        let count = 0;
        return new Promise(async (resolve, reject) => {

            let userCart = await cart.findOne({ user: objectId(userId) })
            if (userCart) {
                count = userCart.cartItems.length
                console.log(count + "        count");
            }
            resolve(count)
        })
    },
    changeProductQuantity :(details)=>{
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        console.log(details)

        return new Promise(async(resolve,reject)=>{
            if(details.count ==-1 && details.quantity==1  ){
                await cart.updateOne({_id:objectId(details.cart)},
            {
                $pull:{cartItems:{product:objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct :true})
            })
            }else{
               await cart.updateOne({_id:objectId(details.cart),'cartItems.product':objectId(details.product)},
               {
                "$set": { "cartItems.$.quantity": details.quantity+details.count }
               }).then((response)=>{

                   resolve(response)
               })
            }
            
        })

    }
}





