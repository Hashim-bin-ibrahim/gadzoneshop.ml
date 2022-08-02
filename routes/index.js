var express = require('express');
var router = express.Router();
var sms = require('../config/verify');
const userHelpers = require('../helpers/user-helpers');
var vendorHelper = require('../helpers/vendor-helper')
const activeCat = require('../middleWare/activeCat');


//middleware for user session  checking
function userLoggedIn(req, res, next) {
  req.session.userLoggIn ? next() : res.redirect('/login')
}


/* GET home page. */
router.get('/',  async(req, res, next) =>{
 
    userDetails = req.session.user

    const rendorData = {}

    
    let cartCount = 0;
     if(req.session.user) {
      cartCount =  userHelpers.getCartCount(req.session.user._id)
    }

    let mobileData = await userHelpers.mobileData()
    let tabletData = await userHelpers.tabletData()
    let laptopData = await userHelpers.laptopData()

    let avlCat = await activeCat.availableCat(rendorData)
    rendorData.avlCat = avlCat
    rendorData.laptopData = laptopData
    rendorData.tabletData = tabletData
    rendorData.cartCount = cartCount
    rendorData.mobileData = mobileData
    rendorData.userDetails = userDetails
    res.render('index', rendorData);
  
});


//user login get

router.get('/login', (req, res) => {
  if (req.session.userLoggIn) {
    res.redirect('/');
  } else

    res.render('user/user-login', {loginErr :req.session.loginErr, Login: true })
     req.session.loginErr = false
})

//user login post 
router.post('/login', (req, res) => {
  userHelpers.userLogin(req.body).then((response) => {
    if (response.userDetails) {
      req.session.userLoggIn = true
      req.session.user = response.userDetails
      res.redirect('/')
    } else {
      req.session.loginErr = true
      req.session.userLoggIn = false
      res.redirect('/login')
    }
  })
})


//show product page by categories
router.get('/products/:id', async (req, res) => {
  let rendorData = {}
  let proId = req.params.id
  // const productData = {}
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  if (req.session.user) {
    rendorData.userLogIn = true
  }

  let avlCat = await activeCat.availableCat(rendorData)

  await activeCat.proByCat(proId).then((response) => {
    userDetails = req.session.user


    rendorData.avlPro = response.avlPro
    rendorData.cartCount = cartCount
    rendorData.userDetails = userDetails
    res.render('user/products', rendorData)
  })
})

//user signup get
var userExists = false
router.get('/user-signup', (req, res) => {
  res.render('user/user-signup', { userExists: req.session.userExist, Login: true })
  req.session.userExist = false
})

//user signup post
router.post('/user-signup', (req, res) => {
  userHelpers.userAvlCheck(req.body).then((response) => {

    if (response) {  
      console.log("user exist its a message from user signup page");
      req.session.userExist = true
      res.redirect('/user-signup')
    } else {
      console.log("usernot Exist.....its a amessage from index js 106................");
      req.session.userData = true
      req.session.userData = req.body
      


      sms.doSms(req.body).then((data) => {
        if (data) {
          res.redirect('/user-verification')
        } else {
          res.redirect('/user-signup')
        }
      })

  
    }

  })
})

router.get('/user-verification', (req, res) => {
  res.render('user/user-verification', { Login: true })
})

router.post('/otpVerify', (req, res) => {
 
  sms.otpVerify(req.body,req.session.userData).then((data) => {
    if (data.valid) {
      userHelpers.doSignup(req.session.userData).then((response) => {
        res.redirect('/login')
      })
    } else {
      console.log("verification problemm");
      res.redirect('/user/user-verification')
    }
  })

})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})


// add product from common  product page 
router.get('/add-to-cart/:id', userLoggedIn, (req, res) => {
  let proId = req.params.id
  let userId = req.session.user._id
  userHelpers.addToCart(proId, userId, 1).then((response) => {
    if(response.stockOut){
      res.json(response)
    }else{
   
      res.json({ status: true })
    }
  
    
  })
})

//save address from checkout page

router.post('/save-address', (req, res) => {


  let userId = req.session.user._id
  userHelpers.saveAddress(req.body, userId).then((response) => {

    if (response.addressLimit) {
      res.json({ addressExist: true })
    } else {
      res.json(response)
    }

  })

})

// delete address
router.get('/delete-address/:id', (req, res) => {
  let addressId = req.params.id

  let userId = req.session.user._id
  userHelpers.deleteAddress(addressId, userId).then((response) => {
    res.redirect('/checkOut')
  })

})

router.get('/delete-address_myAddress/:id', (req, res) => {
  let addressId = req.params.id

  let userId = req.session.user._id
  userHelpers.deleteAddress_myAddress(addressId, userId).then((response) => {
    res.redirect('/my_address')
  })

})


//add to cart from product details page
router.post('/addToCart', (req, res) => {
  let qnty = parseInt((req.body.quantity))
  let proId = req.body.proId
  let userId = req.session.user._id
  
  userHelpers.addToCart(proId, userId, qnty).then((response) => {
    if(response.stockOut){
      
      res.json(response)
    }else{
    
      res.json({ status: true })
    }
  })
})

router.get('/add__To__cart/:id',(req,res)=>{
  let qnty = 1
  let userId = req.session.user._id
  let proId = req.params.id
  userHelpers.add_To_Cart_frm_wishlst(proId,userId,qnty).then((response) => {
    if(response.stockOut){
      
      res.json(response)
    }
    if(response.productExist){
      res.json(response)
    }
    else{
    
      res.json({ status: true })
    }
  })
})


router.get('/cart', userLoggedIn, async (req, res) => {
  // getting count  of cart product start  
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  // getting count  of cart product end  

  let userId = req.session.user._id
  let cartProducts = await userHelpers.showCartPro(userId)
  let cartSum = 0
  if (cartProducts.length > 0) {
    cartSum = await userHelpers.cartSubTotal(userId)

    req.session.cartsum = cartSum
    
  }
  // let subTotal = req.session.cartsum
  res.render('user/cart', { cartProducts, cartSum, cartCount })
})





router.post('/change-product-quantity', (req, res) => {

  userHelpers.changeProductQuantity(req.body).then((response) => {

    res.json(response)
  })
})




router.post('/quantity-change', (req, res) => {

  userHelpers.quantityChange(req.body).then((response) => {

    res.json({ status: true })

  })
})



router.get('/product-details/:id', (req, res) => {
  proId = req.params.id
  userHelpers.productDetails(proId).then(async (proDetails) => {
    
    let cartCount = null
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
    }
    let rendorData = {}
    rendorData.cartCount = cartCount
    rendorData.proDetails = proDetails

    res.render('user/productDetails', rendorData)
  })
})


router.get('/checkOut', async (req, res) => {
  let rendorData = {}
  let userId = req.session.user._id
  rendorData.userId = userId
  let existAddress = await userHelpers.existAddress(userId)
  rendorData.existAddress = existAddress
  res.render('user/checkout', rendorData)
})


router.get('/my_address',async(req,res)=>{
  let rendorData = {}
  let userId = req.session.user._id
 
  let existAddress = await userHelpers.existAddress(userId)
  rendorData.userId = userId
  rendorData.existAddress = existAddress
  res.render('user/my-address',rendorData)
})


router.get('/edit_address/:id',async(req,res)=>{
  let rendorData = {}
  let addressId  = req.params.id
   let addressDetails =await userHelpers.getAddressDetails(addressId)
  
   rendorData.addressDetails = addressDetails
  res.render('user/my-address',rendorData)

})

router.post('/save_Edit_address/:id',async(req,res)=>{
 
  await userHelpers.save_Edited_Address(req.params.id,req.body).then(()=>{
    
    res.redirect('/my_address')
  })
 
})



router.post('/checkOut-post', async (req, res) => {

  let cartSum = req.session.cartsum
  let rendorData = {}
  rendorData.cartSum = cartSum
  global = rendorData

  res.redirect('/checkout')
})


router.post('/place-order', async (req,res,next) => {
  try {
    
  let grand_Total = req.body.grandTotal
  let addressId = req.body.addressDetails
  let userId = req.session.user._id
  let address = await userHelpers.userAddress(addressId, userId)
  let paymentMethod = req.body.paymentMethod
  let cartSum = req.session.cartsum
  let totalPrice = cartSum[0].subTotal
  let cartProducts = await userHelpers.getCartProducts(userId)
  

  userHelpers.placeOrder(address, userId, cartSum, cartProducts, paymentMethod, grand_Total).then((orderId) => {

    if (req.body.paymentMethod === 'COD') {
      res.json({ COD_success: true })
    }
    else {
      console.log("razorpay started");
      userHelpers.generateRazorPAy(orderId, grand_Total).then((response) => {
        res.json(response)
      })
    }
  })
} catch (error) {
    next(error)
}
})

router.post('/verify-payment', (req, res) => {
  userHelpers.verifyPayment(req.body).then(async () => {
    await userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false })
  })
})



router.get('/order', async (req, res) => {
  let userId = req.session.user._id
  await userHelpers.orderedProducts(userId).then((orderPro) => {
  
    res.render('user/orderList', { userId, orderPro })
  })
})


router.get('/order-success', (req, res) => {
  res.render('user/order-success')
})


router.get('/payment/:id', async (req, res) => {
  let address = req.params.id
  let userId = req.session.user._id
  let cartPro = await userHelpers.showCartPro(userId)
  let AvailCoupon = await userHelpers.getCoupon()
  let cartSum = req.session.cartsum
  let rendorData = {}
  rendorData.AvailCoupon = AvailCoupon
  rendorData.address = address
  rendorData.cartSum = cartSum
  rendorData.cartPro = cartPro
  res.render('user/payment', rendorData)
})

router.get('/ordered-pro-details', (req, res) => {
  let { productId,orderId} = req.query
  
  userHelpers.orderedProList(productId).then(async(proDetails) => {
  
    let orderData =await userHelpers.orderDetails(orderId,productId)
    console.log(orderData,"=========================user side Order    Data===========================");
    res.render('user/ordered_pro-details', { proDetails:proDetails,orderData:orderData })
  })

})

router.post('/couponCheck', async (req, res) => {

  let { couponCode: couponCode, subtotal: subtotal, date: date } = req.body
  let userId = req.session.user._id

  await userHelpers.couponCheck(couponCode, subtotal, date, userId).then((data) => {

    if (data) {

      res.json(data)
    }

  })

})

router.get('/delete_product_from_wishlist/:id',async(req,res)=>{
let  proId = req.params.id
await userHelpers.delete_product_from_wishlist(proId).then((response)=>{
  if(response.deleted){
    res.json({status:true})
  }
})


})


router.get('/my_profile',userLoggedIn, async (req, res) => {
  let rendorData = {}
  let userId = req.session.user._id
  let user = req.session.user
  let orderDetails = await userHelpers.orderedProducts(userId)

  rendorData.orderDetails = orderDetails
  rendorData.user = user


  res.render('user/myProfile',{user:user})
})

router.get('/example',(req,res)=>{
  res.render('user/example')
})



router.get('/band_filter/:name', async(req,res)=>{
  let brand_name = req.params.name

  let brand_filter = await userHelpers.brandFilter(brand_name)
  
  console.log(brand_filter);
  

})

router.get('/navbar',(req,res)=>{
  res.render('user/navbar',{error:true})
})

router.get('/wishList',async(req,res)=>{
  userId = req.session.user._id
  let wishProducts  =  await  userHelpers.wishedItems(userId)

  res.render('user/wishList',{wishProducts:wishProducts})
})


router.get('/add-to-wishlist/:id', userLoggedIn, (req, res) => {
  let proId = req.params.id
  let userId = req.session.user._id
 
  userHelpers.addToWishlist(proId, userId).then((response) => {
    if(response.stockOut){
      res.json(response)
    }else{
      res.json({ status: true })
    }
  
    
  })
})



module.exports = router;






