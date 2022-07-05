var express = require('express');
const session = require('express-session');
const async = require('hbs/lib/async');
const { default: mongoose } = require('mongoose');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers');
const { avlPro } = require('../helpers/vendor-helper');
var vendorHelper = require('../helpers/vendor-helper')
const activeCat = require('../middleWare/activeCat');
const { find } = require('../models/category');

//middleware for user session  checking
function userLoggedIn(req, res, next) {
  req.session.userLoggIn ? next() : res.redirect('/login')
}


/* GET home page. */
router.get('/', function (req, res, next) {
  vendorHelper.avlPro().then(async (data) => {
    userDetails = req.session.user
    console.log(userDetails);
    const rendorData = {}

    let cartCount = null
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
    }

    let avlCat = await activeCat.availableCat(rendorData)
    rendorData.cartCount = cartCount
    rendorData.data = data
    rendorData.userDetails = userDetails
    res.render('index', rendorData);
  })
});


//user login get
router.get('/login', (req, res) => {
  if (req.session.userLoggIn) {
    res.redirect('/');
  } else
    res.render('user/user-login', { Login: true })
})

//user login post 
router.post('/login', (req, res) => {
  userHelpers.userLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggIn = true
      req.session.user = response.userDetails
      res.redirect('/')
    } else {
      req.session.userLoggIn = false
      res.redirect('/login')
    }
  })
})


//show product page by categories
router.get('/products/:id', async (req, res) => {
  let proId = req.params.id
  // const productData = {}
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let rendorData = {}
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
  res.render('user/user-signup', { userExists: userExists, Login: true })
  userExists = false
})

//user signup post
router.post('/user-signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {

    if (response) {
      console.log(response);
      userExists = false
      req.session.userLogin = true
      req.session.userData = response.user
      res.redirect('/login')
    } else {
      req.session.userExist = true
      userExists = req.session.userExist
      res.redirect('/user-signup')
    }

  })
})



router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})



router.get('/add-to-cart/:id' , (req, res) => {
  console.log('api call');
  let proId = req.params.id
  let userId = req.session.user._id
  userHelpers.addToCart(proId, userId).then(() => {
    res.json({status:true})
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
  console.log(cartProducts);
  let cartSum = await userHelpers.cartSubTotal(userId)
  console.log(cartSum);
  res.render('user/cart', { cartProducts,cartSum, cartCount })
})

router.post('/change-product-quantity',(req,res)=>{

  console.log(req.body.count);
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    console.log(response)
    res.json(response)
  })
})



module.exports = router;
