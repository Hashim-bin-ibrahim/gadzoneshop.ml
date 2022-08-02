var db = require('../config/connection')
const category = require('../models/category')


const vendor = require('../models/vendor')
const order = require('../models/order')
const coupon = require('../models/coupon')
var objectId = require('mongodb').ObjectId
const moment = require('moment')
const user = require('../models/user')

module.exports = {

    deleteCategory: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_CATEGORY).updateOne({ _id: objectId(userId) }, { $set: { "isDeleted": true } }).then((response) => {
                console.log(response);
                resolve(response)
            })

        })
    },
    editCat: () => {
        return new Promise(async (resolve, reject) => {
            const availCategory = await category.aggregate([{ $match: { edit: true } }])
            resolve(availCategory)

        })
    },
    updateCat: (catId, catName) => {
        return new Promise(async (resolve, reject) => {
            await category.updateOne({ _id: catId }, { $set: { name: catName, edit: false, editTo: "default" } }).then((response) => {
                console.log(response);
                resolve(response)
            })

        })
    },
    showCategory: () => {
        return new Promise(async (resolve, reject) => {
            const availCategory = await category.aggregate([{ $match: { access: false, isBlocked: false } }])

            console.log(availCategory);
            resolve(availCategory);


        })

    },
    blockCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            await category.updateOne({ _id: objectId(catId) }, { $set: { isBlocked: true } }).then((response) => {
                console.log(response);
                resolve(response)
            })

        })
    },
    blockVen: (catId) => {
        return new Promise(async (resolve, reject) => {
            await vendor.updateOne({ _id: objectId(catId) }, { $set: { canLogin: false } }).then((response) => {
                console.log(response);
                resolve(response)
            })

        })
    },
    blockedCat: () => {
        return new Promise(async (resolve, reject) => {
            const availCategory = await category.aggregate([{ $match: { isBlocked: true, access: true } }])

            console.log(availCategory);
            resolve(availCategory);


        })



    },
    holdedCat: () => {
        return new Promise(async (resolve, reject) => {
            const availCategory = await category.aggregate([{ $match: { isBlocked: true, access: false } }])
            console.log(availCategory);
            resolve(availCategory);


        })



    },
    unblockCat: (catId) => {
        return new Promise(async (resolve, reject) => {
            await category.updateOne({ _id: objectId(catId) }, { $set: { isBlocked: false } }).then((response) => {
                console.log(response);
                resolve(response)
            })

        })
    },
    agreeCat: (catId) => {
        return new Promise(async (resolve, reject) => {
            await category.updateOne({ _id: objectId(catId) }, { $set: { access: true, isBlocked: false } }).then((response) => {

                resolve(response)
            })

        })
    },
    activeCategory: () => {
        return new Promise(async (resolve, reject) => {
            const activeCat = await category.aggregate([{ $match: { access: true, isBlocked: false } }])

            console.log(activeCat);
            resolve(activeCat);


        })

    },
    holdVen: (venId) => {

        return new Promise(async (resolve, reject) => {
            await vendor.updateOne({ _id: venId }, { $set: { isBlocked: true } }).then((response) => {
                console.log(response);
                resolve(response)
            })

        })
    },


    getAllCoupon: () => {
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
    getOrderList: () => {
        return new Promise(async (resolve, reject) => {
            let orderList = await order.aggregate([
                {
                    '$match': {
                        '__v': 0
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
                }
            ])

            resolve(orderList)
        })

    },
    getRevenue: () => {
        let paymentData = []
        return new Promise(async(resolve, reject) => {
            let COD_revenue = await order.aggregate([
                {
                  '$match': {
                    'paymentType': 'COD'
                  }
                }, {
                  '$unwind': {
                    'path': '$products'
                  }
                }, {
                  '$match': {
                    'products.orderStatus': 'delivered'
                  }
                }
              ])

              let COD_length  = COD_revenue.length
              console.log(COD_length);
              paymentData.push(COD_length)

              let online_Revenue = await order.aggregate([
                {
                  '$match': {
                    'paymentType': 'Online-Payment'
                  }
                }, {
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

    dailyEarning :()=>{
        let dateIso = new Date()
        let date = moment(dateIso).format('DD-MM-YYYY')
        console.log(date);
        return new Promise(async(resolve,reject)=>{
            let dailyEarnings = await order.aggregate([
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
         console.log("==========================");
            resolve(dailyEarnings)

        })

    },

    dailySales:()=>{
        return new Promise(async(resolve,reject)=>{
            let sales = await order.aggregate(
                [
                    {
                      '$match': {
                        '__v': 0
                      }
                    }
                  ]

            )
            let count = sales.length
            resolve(count)
    
        })
      
    },
    totalUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let allUsers = await user.aggregate(
                [
                    {
                      '$match': {
                        '__v': 0
                      }
                    }
                  ]
            )
            total_users = allUsers.length
            resolve(total_users)
        })

    }



}
