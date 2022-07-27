var db = require('../config/connection')
const { resolve } = require('path')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId
var bcrypt = require('bcrypt')
const category = require('../models/category')
const Vendor = require('../models/vendor')

const product = require('../models/product')
const req = require('express/lib/request')
const { Promise } = require('mongoose')
const coupon = require('../models/coupon')
const order = require('../models/order')

module.exports = {
  vendorAvlCheck: (vendorData) => {
    return new Promise(async (resolve, reject) => {
      const exist = await Vendor.findOne({ email: vendorData.email })
      if (exist) {
        var vendorExist = true

        resolve(vendorExist)
      } else {
        var vendorExist = false
        resolve(vendorExist)

      }
    })
  },
  doSignup: (vendorData) => {
    console.log(vendorData);

    return new Promise(async (resolve, reject) => {
      vendorData.password = await bcrypt.hash(vendorData.password, 10)
      const vendors = Vendor.create({ name: vendorData.name, email: vendorData.email, password: vendorData.password, phoneNumber: vendorData.phonenumber })
      resolve(vendors)
    })
  },

  getallvendors: () => {
    return new Promise(async (resolve, reject) => {
      let users = await Vendor.aggregate([{ $match: { canLogin: false, isBlocked: false } }])
      console.log(users);
      resolve(users)
    })
  },
  holdedVen: () => {
    return new Promise(async (resolve, reject) => {
      let holdVen = await Vendor.aggregate([{ $match: { canLogin: false, isBlocked: true } }])
      resolve(holdVen)
    })
  },
  activeVen: () => {
    return new Promise(async (resolve, reject) => {
      let actVen = await Vendor.aggregate([{ $match: { canLogin: true, isBlocked: false } }])
      resolve(actVen)
    })
  },
  blockedven: () => {
    return new Promise(async (resolve, reject) => {
      let blockVen = await Vendor.aggregate([{ $match: { canLogin: true, isBlocked: true } }])
      resolve(blockVen)
    })
  },
  blockVen: (catId) => {
    return new Promise(async (resolve, reject) => {
      await Vendor.updateOne({ _id: objectId(catId) }, { $set: { isBlocked: true } }).then((response) => {
        console.log(response);
        resolve(response)
      })

    })
  },
  unblockVen: (catId) => {
    return new Promise(async (resolve, reject) => {
      await Vendor.updateOne({ _id: objectId(catId) }, { $set: { isBlocked: false } }).then((response) => {
        console.log(response);
        resolve(response)
      })

    })
  },

  admitVendor: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      await Vendor.updateOne({ _id: vendorId }, { $set: { canLogin: true } }).then((response) => {

        resolve(response)
      })

    })
  },
  vendorLogin: (vendorData) => {
    return new Promise(async (resolve, reject) => {

      let response = {}
      let user = await Vendor.findOne({ email: vendorData.email, canLogin: true })
      console.log(user);

      if (user) {
        const password = await bcrypt.compare(vendorData.password, user.password)
        if (password) {
          response.vendorDetails = user;
          response.status = true;
          console.log('vendor approved');
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
  addProduct: (req, Vendors) => {
    const newProduct = req.body;
    const files = req.files;
    vendorInfo = Vendors
    let response = {}

    return new Promise(async (resolve, reject) => {
      const exist = await product.exists({ name: newProduct.name })
      if (exist) {
        response.proExist = true
        resolve(response)
      } else {
        response.proExist = false
        //for  getting vendor _id
        const venData = await Vendor.findOne({ name: vendorInfo.name })
        const objIdVendor = venData._id
        // for getting objId of Category
        const catData = await category.findOne({ name: newProduct.category })
        var objIdCategory = catData._id


        const proObj = new product(
          {
            name: newProduct.name,
            price: newProduct.price,
            stock: newProduct.stock,
            category: objIdCategory,
            new: newProduct.new,
            sale: newProduct.sale,
            outOfStock: newProduct.outofstock,
            description: newProduct.description,
            brand_name: newProduct.brand_name,
            productPictures: files,
            createdBy: objIdVendor,
          }
        )
        await proObj.save().then((response) => {

          resolve(response)
        })
      }
    })
  },
  addCoupon: (req) => {
    let newCoupon = req.body;
    let response = {}

    return new Promise(async (resolve, reject) => {
      const exist = await coupon.exists({ couponCode: newCoupon.couponCode })
      if (exist) {
        console.log("couponExist");
        response.couponExist = true
        resolve(response)
      } else {
        console.log("coupon not exist");

        const new_Coupon = new coupon(
          {
            couponCode: newCoupon.couponCode,
            description: newCoupon.description,
            couponType: newCoupon.couponType,
            couponValue: newCoupon.couponValue,
            couponValidFrom: newCoupon.couponValidFrom,
            couponValidTo: newCoupon.couponValidTo,
            minValue: newCoupon.minValue,
            maxVAlue: newCoupon.maxVAlue,
            limit: newCoupon.limit,
            couponUsageLimit: newCoupon.couponUsageLimit,
            // category: objIdCategory,

          }
        )
        await new_Coupon.save().then((response) => {
          console.log(response);
          resolve(response)
        })
      }
    })
  },

  //    addCategory : (vendorData)=>{
  //        return new promise (async(resolve,reject)=>{
  //         await category.create(vendorData).then((data)=>{
  //             console.log(data);
  //             resolve(data)


  //              })

  //        })

  //      },
  sendCat: (categoryData) => {
    return new Promise(async (resolve, reject) => {
      const exist = await category.exists({ name: categoryData.name })
      if (exist) {
        var exists = true
        resolve(exists)
      } else {
        exists = false
        let data = await category.create(categoryData)
        console.log(data);
        resolve(exists)
      }

    })

  },

  showCategory: () => {
    return new Promise(async (resolve, reject) => {
      const activeCat = await category.aggregate([{ $match: { access: true, isBlocked: false } }])

      console.log(activeCat);
      resolve(activeCat);


    })

  },
  blockCategory: () => {

    return new Promise(async (resolve, reject) => {
      const blockedCat = await category.aggregate([{ $match: { isblocked: true, access: true } }])
      resolve(blockedCat)
    })
  },
  unblockCategory: () => {

    return new Promise(async (resolve, reject) => {
      const blockedCat = await category.aggregate([{ $match: { isblocked: false, access: true } }])
      resolve(blockedCat)
    })
  },
  editCategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      const exist = await category.exists({ name: catId.name })
      if (exist) {
        const categoryExist = true;
        resolve(categoryExist);
      } else {
        categoryExist = false
        const newname = catId.name

        await category.updateOne({ _id: catId }, { $set: { name: newname, edit: true } }).then((response) => {

          resolve(response)
        })
      }
    })
  },
  allCategory: () => {
    return new Promise(async (resolve, reject) => {

      const allCat = await category.aggregate([{ $match: { isBlocked: false } }])

      resolve(allCat)
    })
  },
  //vendor case
  viewPro: () => {
    return new Promise(async (resolve, reject) => {
      const avlProduct = await product.aggregate([
        {
          '$lookup': {
            'from': 'categories',
            'localField': 'category',
            'foreignField': '_id',
            'as': 'result'
          }
        }, {
          '$match': {
            'isBlocked': false
          }
        }
      ])
      resolve(avlProduct)
    })
  },
  BlockedPro: () => {
    return new Promise(async (resolve, reject) => {
      const avlProduct = await product.aggregate([
        {
          '$lookup': {
            'from': 'categories',
            'localField': 'category',
            'foreignField': '_id',
            'as': 'result'
          }
        }, {
          '$match': {
            'isBlocked': true
          }
        }
      ])
      resolve(avlProduct)
    })

  },
  blockPro: (ProId) => {
    return new Promise(async (resolve, reject) => {
      await product.updateOne({ _id: ProId }, { $set: { 'isBlocked': true } }).then((response) => {

        resolve(response)
      })

    })
  },
  unblockPro: (ProId) => {
    return new Promise(async (resolve, reject) => {
      await product.updateOne({ _id: ProId }, { $set: { 'isBlocked': false } }).then((response) => {

        resolve(response)
      })

    })
  },
  //admin case 
  avlPro: () => {
    return new Promise(async (resolve, reject) => {
      const avlProduct = await product.aggregate([
        {
          '$lookup': {
            'from': 'categories',
            'localField': 'category',
            'foreignField': '_id',
            'as': 'result'
          }
        }, {
          '$lookup': {
            'from': 'vendors',
            'localField': 'createdBy',
            'foreignField': '_id',
            'as': 'res'
          }
        }, { $match: { isBlocked: false } }
      ])
      // console.log(avlProduct);
      resolve(avlProduct)
    })
  },
  showpro: () => {
    return new Promise(async (response, reject) => {
      const avlPro = await product.aggregate([
        {
          '$lookup': {
            'from': 'categories',
            'localField': 'category',
            'foreignField': '_id',
            'as': 'result'
          }
        }, {
          '$lookup': {
            'from': 'vendors',
            'localField': 'createdBy',
            'foreignField': '_id',
            'as': 'res'
          }
        }
      ])
    })
  },
  getOrderList: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      let orderList = await order.aggregate([
        {
          '$project': {
            '__v': 0
          }
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'user',
            'foreignField': '_id',
            'as': 'userLookup'
          }
        }, {
          '$unwind': {
            'path': '$userLookup'
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
          '$lookup': {
            'from': 'vendors',
            'localField': 'productLookup.createdBy',
            'foreignField': '_id',
            'as': 'vendorLookup'
          }
        }, {
          '$unwind': {
            'path': '$vendorLookup'
          }
        }, {
          '$match': {
            'vendorLookup._id': objectId(vendorId)
          }
        }, {
          '$sort': {
            '_id': -1
          }
        }
      ])

      resolve(orderList)
    })

  },
  orderedProDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      let proDetails = await product.aggregate([
        {
          '$match': {
            '_id': objectId(proId)
          }
        }, {
          '$lookup': {
            'from': 'categories',
            'localField': 'category',
            'foreignField': '_id',
            'as': 'categoryLookup'
          }
        }, {
          '$unwind': {
            'path': '$categoryLookup'
          }
        }, {
          '$lookup': {
            'from': 'vendors',
            'localField': 'createdBy',
            'foreignField': '_id',
            'as': 'vandorLookup'
          }
        }, {
          '$unwind': {
            'path': '$vandorLookup'
          }
        }, {
          '$unwind': {
            'path': '$productPictures'
          }
        }
      ])
      console.log("--------------------------------------");
      console.log(proDetails);
      resolve(proDetails)
    })

  },
  packProduct : (orderId,productId)=>{
    console.log(orderId,productId,"lllllllllllllllllllllllllllllloooooooooooooooooooooooooooooiiiiiiiiiiiiiiiiiiiii");
    return new Promise(async(resolve,reject)=>{
      await order.updateOne({_id:objectId(orderId),'products.product':objectId(productId)},
      {
        $set : {
          'products.$.placed' : false,'products.$.packed':true,'products.$.orderStatus' : "packed"
        }
      }).then((response)=>{
        
        response.status = true
        resolve(response)
      })
    })
  },
  shippProduct : (orderId,productId)=>{
    return new Promise(async(resolve,reject)=>{
      await order.updateOne({_id:objectId(orderId),'products.product':objectId(productId)},
      {
        $set : {
          'products.$.packed' : false,'products.$.shipped':true,'products.$.orderStatus' : "shipped"
        }
      }).then((response)=>{
        response.status = true
        resolve(response)
      })
    })
  },

  deliverProduct : (orderId,productId)=>{
    return new Promise(async(resolve,reject)=>{
      await order.updateOne({_id:objectId(orderId),'products.product':objectId(productId)},
      {
        $set : {
          'products.$.shipped' : false,'products.$.delivered':true,'products.$.orderStatus' : "delivered"
        }
      }).then((response)=>{
        response.status = true
        resolve(response)
      })
    })
  },

  cancelProduct : (orderId,productId)=>{
    return new Promise(async(resolve,reject)=>{
      await order.updateOne({_id:objectId(orderId),'products.product':objectId(productId)},
      {
        $set : {
          'products.$.delivered' : false,'products.$.cancelled':true,'products.$.orderStatus' : "cancelled"
        }
      }).then((response)=>{
        response.status = true
        resolve(response)
      })
    })
  },
  getUsersDetails : ()=>{
    return new Promise (async(resolve,reject)=>{
     let userData =  await order.aggregate([
        {
          '$project': {
            '__v': 0
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'user', 
            'foreignField': '_id', 
            'as': 'usersLookup'
          }
        }, {
          '$unwind': {
            'path': '$usersLookup'
          }
        }, 
      ])
      resolve(userData)

    })
  },
  getRevenue: (vendorId) => {
    let paymentData = []
    return new Promise(async(resolve, reject) => {
        let COD_revenue = await order.aggregate([
          {
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
            '$match': {
              'productLookup.createdBy': objectId(vendorId)
            }
          },
          {
            '$match': {
              'paymentType': 'COD'
            }
          },
          {
            '$unwind': {
              'path': '$products'
            }
          }, {
            '$match': {
              'products.orderStatus': 'delivered'
            }
          }
        ])
          console.log(COD_revenue);
          let COD_length  = COD_revenue.length
          console.log(COD_length);
          paymentData.push(COD_length)

          let online_Revenue = await order.aggregate([
            {
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
              '$match': {
                'productLookup.createdBy': objectId(vendorId)
              }
            },
            {
              '$match': {
                'paymentType': 'COD'
              }
            },
            {
              '$unwind': {
                'path': '$products'
              }
            }, {
              '$match': {
                'products.orderStatus': 'delivered'
              }
            }
          ])

          let online_length  = online_Revenue.length
        
          paymentData.push(online_length)

          
          resolve(paymentData)

    })
},

dailyEarning :(vendorId)=>{
    let dateIso = new Date()
    let date = moment(dateIso).format('DD-MM-YYYY')
    console.log(date);
    return new Promise(async(resolve,reject)=>{
        let dailyEarnings = await order.aggregate([
          {
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
            '$match': {
              'productLookup.createdBy': objectId(vendorId)
            }
          },
            {
              '$match': {
                '__v': 0
              }
            }, {
              '$unwind': {
                'path': '$products'
              }
            }, {
              '$match': {
                'products.orderStatus': 'delivered'
              }
            },
            {
                '$project': {

                    totalAmount:1,
                    createdAt: { $dateToString: { format: "%d-%m-%Y", date: '$createdAt' } },
                }
            },
            // {
            //     '$match':{
            //         createdAt : date
            //     }
            // },
            {
                '$group': {
                  '_id': 'null', 
                  'totalAmount': {
                    '$sum': '$totalAmount'
                  }
                }
              }
          ])
          console.log(dailyEarnings);
          let sum = dailyEarnings[0].totalAmount
     
        resolve(sum)

    })

},

dailySales:(vendorId)=>{
    return new Promise(async(resolve,reject)=>{
        let sales = await order.aggregate(
            [
              {
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
                '$match': {
                  'productLookup.createdBy': objectId(vendorId)
                }
              },
                
              ]

        )
        let count = sales.length
        resolve(count)

    })
  
},
totalUsers:()=>{
    return new Promise(async(resolve,reject)=>{
        let allUsers = await order.aggregate(
            [
              {
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
                '$match': {
                  'productLookup.createdBy': objectId(vendorId)
                }
              },
              ]
        )
        total_users = allUsers.length
        resolve(total_users)
    })

}

}






