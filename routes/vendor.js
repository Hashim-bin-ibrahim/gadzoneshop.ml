var express = require('express');
var router = express.Router();
const Vendor = require('../models/vendor')

var vendorHelper = require('../helpers/vendor-helper')
var adminHelpers = require('../helpers/admin-helpers')
const userHelper = require('../helpers/user-helpers')
var sms = require('../config/verify');
const store = require('../public/middleware/multer');
const async = require('hbs/lib/async');



var exist = false

//middleware for vendor session  checking
function vendorLoggedIn(req,res,next){
  req.session.vendorLogiin ? next():res.redirect('/vendor')
}


router.get('/', (req, res) => {
  if (req.session.vendorLogiin) {
    res.redirect('/vendor/vendor-dash')
  } else {
    res.render('vendor/vendor-login', { loginErr: req.session.loginError, Login: true })
    req.session.loginError = false
  }
})

router.get('/vendor-dash',async (req, res) => {
  let renderdata = {}
  if (req.session.vendorLogiin) {
    res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
    const vendorId = req.session.vendorDetails._id
    let daily_earning = await vendorHelper.dailyEarning(vendorId)

    console.log(daily_earning);

    let payment_Data = await vendorHelper.getRevenue(vendorId)
    let sales = await vendorHelper.dailySales(vendorId)
     let users = await vendorHelper.totalUsers(vendorId)

    renderdata.sales = sales
     renderdata.users = users
    renderdata.daily_earning = daily_earning,
    renderdata.payment_Data = payment_Data
    renderdata.vendorLogin = true
    renderdata.vendorId = vendorId



    res.render('vendor/vendor-dashboard',renderdata)
  } else {
    res.redirect('/vendor')
  }
})
 

var signupErr = false; 
router.get('/vendor-signup', (req, res) => {
  signupErr = req.session.signupErr
  res.render('vendor/vendor-signup', { exist: exist, Login: true, signupErr: signupErr })
  signupErr = false
})

//active category
var categoryexists = false
router.get('/active-cat', (req, res) => {
  vendorHelper.showCategory().then((data) => {
    const vendorId = req.session.vendorDetails
    res.render('vendor/active-cat', { vendorLogin: true, vendorId: vendorId, data: data, categoryexists: categoryexists });
    categoryexists = false
  })

})
//add new cat
var categoryexists = false

router.get('/add-new-cat',vendorLoggedIn, (req, res) => {
  const vendorId = req.session.vendorDetails
  res.render('vendor/add-new-cat', { vendorLogin: true, categoryexists: categoryexists, vendorId: vendorId });
  categoryexists = false;


})


router.get('/admit-vendor/:id', (req, res) => {
  let userId = req.params.id

  adminHelpers.deleteCategory(vendorId).then((response) => {
    res.redirect('/admin/dashboard')
  })


})


router.get('/vendor-verification', (req, res) => {
  res.render('vendor/vendor-verification', { Login: true })
})

// add products
var proExists = false
router.get('/add-product',vendorLoggedIn, (req, res) => {
  vendorHelper.allCategory().then((all) => {
    const vendorId = req.session.vendorDetails
    proExists = req.session.proExistsErr
    res.render('vendor/addProduct', { vendorLogin: true, all: all, proExists: proExists, vendorId: vendorId })
    proExists = false
  })
})
//view Products
router.get('/view-poducts',vendorLoggedIn, (req, res) => {
  console.log(req.body);
  vendorHelper.viewPro().then((avlPro) => {
    const vendorId = req.session.vendorDetails
    res.render('vendor/viewproducts', { vendorLogin: true, avlPro: avlPro, vendorId: vendorId })
  })
})
// view blocked products
router.get('/blocked-products', (req, res) => {
  vendorHelper.BlockedPro().then((avlPro) => {
    const vendorId = req.session.vendorDetails
    res.render('vendor/blocked-products', { vendorLogin: true, avlPro: avlPro, vendorId: vendorId })

  })
})


router.post('/vendor-dash',(req, res) => {
  //res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  vendorHelper.vendorLogin(req.body).then((response) => {

    if (response.status) {
      //let user = await Vendor.findOne({email : req.body.email})
      req.session.vendorLogiin = true
      req.session.vendorDetails = response.vendorDetails;
      res.redirect('/vendor/vendor-dash')
    } else {
      req.session.loginError = true,
      res.redirect('/vendor')
    }
  })
})


//block category from active category
router.get('/block-cat/:id', (req, res) => {
  let catId = req.params.id
  adminHelpers.blockCategory(catId).then((response) => {
    res.redirect('/vendor/active-cat')
  })
})



//otp verify vendor side 
router.post('/otpVerify', (req, res) => {
  console.log(req.session.vendorData);
  sms.otpVerify(req.body, req.session.vendorData).then((data) => {
    if (data.valid) {
      vendorHelper.doSignup(req.session.vendorData).then((response) => {
        console.log(response);
        res.redirect('/vendor')
      })
    } else {
      console.log("verification problemm");
      res.redirect('/vendor/vendor-verification')
    }
  })

})


// vendor signup availability check
router.post('/vendor-signup', (req, res) => {
  vendorHelper.vendorAvlCheck(req.body).then((response) => {
    if (response) {
   
      req.session.signupErr = true
      res.redirect('/vendor/vendor-signup')
    } else {
      req.session.vendorData = true
      req.session.vendorData = req.body
      sms.doSms(req.body).then((data) => {
        if (data) {
          res.redirect('/vendor/vendor-verification')
        } else {
          res.redirect('/vendor/vendor-signup')
        }
      })
    }
  })
})




//vendor edit category post
router.post('/edit-cat/:id', (req, res) => {
  vendorHelper.editCategory(req.body).then((response) => {
    if (exists) {
      categoryexists = true
      console.log('id already exist');
      res.redirect('/vendor/active-cat')
    } else {
      console.log('its not exist');
      res.redirect('/vendor/active-cat')
    }
  })
})




//blocking category
router.get('/blocked-cat/:id', (req, res) => {
  // let catId = req.params.id
  vendorHelper.blockCategory().then((data) => {
    const vendorId = req.session.vendorName
    res.render('vendor/blocked-cat', { data: data, vendorId: vendorId })
  })
})


//unblock category
router.get('/unblocked-cat/:id', (req, res) => {
  // let catId = req.params.id
  vendorHelper.unblockCategory().then((data) => {
    const vendorId = req.session.vendorName
    res.redirect('/vendor/blocked-cat')
  })
})


//blocking products
router.get('/block-pro/:id', (req, res) => {
  const ProId = req.params.id
  vendorHelper.blockPro(ProId)
  res.redirect('/vendor/view-poducts')

})
//unblocking products
router.get('/unblock-pro/:id', (req, res) => {
  const ProId = req.params.id
  vendorHelper.unblockPro(ProId)
  res.redirect('/vendor/blocked-products')

})
//show blocked category
router.get('/blocked-cat',vendorLoggedIn, (req, res) => {
  adminHelpers.blockedCat().then((data) => {
    const vendorId = req.session.vendorName
    res.render('vendor/blocked-cat', { vendorLogin: true, data: data, vendorId: vendorId })
  })
})



//vendor send new category req 
router.post('/send-new-cat',vendorLoggedIn, (req, res) => {
  
  vendorHelper.sendCat(req.body).then((exists) => {
    if (exists) {
      categoryexists = true;
      console.log("already exist");
      res.redirect('/vendor/add-new-cat')
    } else {
      categoryexists = false;
      res.redirect('/vendor/add-new-cat')
      console.log(req.body)
    }
  })
})



router.post('/add-product',vendorLoggedIn, store.array('images', 4), (req, res) => {
  const Vendors = req.session.vendorDetails
  vendorHelper.addProduct(req,Vendors).then(async (response) => {
    // let user = await Vendor.findOne({email:vendorData.email,canLogin:true})
    // console.log(user);
    if (response.proExist) {
      req.session.proExistsErr = true
      res.redirect('/vendor/add-product')
    } else {
      res.redirect('/vendor/add-product');
    }
  })
})




//coupon create page



//logout  
router.get('/logout',(req,res)=>{
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  req.session.vendorLogiin = false;
  res.redirect('/vendor')
})

router.get('/order_list',async(req,res)=>{
  const vendorId = req.session.vendorDetails._id
  
  await vendorHelper.getOrderList(vendorId).then((orderedPro)=>{
    res.render('vendor/user_orderList',{vendorLogin: true,orderedPro:orderedPro})
  })

 
})

router.get('/ordered_pro_details',(req,res)=>{

  let {orderId,productId}=req.query

  // vendorHelper.orderedProDetails(proId).then((proDtails)=>{
  //   res.render('vendor/orderedProDetails',{proDtails:proDtails})
  // })
  userHelper.orderedProList(productId).then(async(proDetails) => {
    let orderData =await vendorHelper.orderDetails(orderId,productId)
    res.render('vendor/orderedProDetails',{proDetails:proDetails,orderData:orderData})
  })
})


router.post('/status_packed',(req,res)=>{
  let {order_Id,product_Id}=req.body

  console.log(order_Id);
  console.log(product_Id);
  vendorHelper.packProduct(order_Id,product_Id).then((response)=>{
    
    if(response){
      res.json({status:true})
    }
    
  })
  

})



router.post('/status_shipped',(req,res)=>{
  let {order_Id,product_Id}=req.body

  console.log(order_Id);
  console.log(product_Id);
  vendorHelper.shippProduct(order_Id,product_Id).then((response)=>{
  
    if(response){
      res.json({status:true})
    }
    
  })
  

})



router.post('/status_delivered',(req,res)=>{
  let {order_Id,product_Id}=req.body

  console.log(order_Id);
  console.log(product_Id);
  vendorHelper.deliverProduct(order_Id,product_Id).then((response)=>{
  
    if(response){
      res.json({status:true})
    }
  })
})

router.post('/status_cancelled',(req,res)=>{
  let {order_Id,product_Id}=req.body
  vendorHelper.cancelProduct(order_Id,product_Id).then((response)=>{
  
    if(response){
      res.json({status:true})
    }
    
  })
  

})

router.get('/users_list',(req,res)=>{
  vendorHelper.getUsersDetails().then((data)=>{
    res.render('vendor/users_List',{vendorLogin: true,data:data})
  })
 
})


module.exports = router;