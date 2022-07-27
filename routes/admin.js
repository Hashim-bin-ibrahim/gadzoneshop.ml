var express = require('express');
const req = require('express/lib/request');
const adminHelpers = require('../helpers/admin-helpers');
const vendorHelpers = require('../helpers/vendor-helper')
const sms = require('../config/verify');
const async = require('hbs/lib/async');
var router = express.Router();

/* GET users listing. */

const emaildb = "hashim@gmail.com";
const passworddb = 123;
var loginErr = false;

//session checking 
function adminloggedin(req, res, next) {
  req.session.adminloggedIn ? next() : res.redirect('/admin');
}

router.get('/', function (req, res) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  if (req.session.adminloggedIn) {
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/admin-login', { loginErr: loginErr, Login: true });
    loginErr = false;
  }

});


// router.get('/dashboard',(req,res)=>{
//   // var abc = (adminHelpers.showcategory(),vendorHelpers.getallvendors())
//   adminHelpers.showcategory().then((data)=>{
//     console.log(data);
//     res.render('admin/admin-dashboard',{data:data})
//   })

// })
router.get('/new-cat-req', adminloggedin, (req, res) => {
  adminHelpers.showCategory().then((data) => {
    res.render('admin/new-cat-req', { adminLogin: true, data: data });
  })

})
//hold category get method
router.get('/hold-cat', adminloggedin, (req, res) => {
  adminHelpers.holdedCat().then((data) => {
    res.render('admin/hold-cat', { adminLogin: true, data: data })
  })

})
//edit categories 
router.get('/edit-cat', adminloggedin, (req, res) => {
  adminHelpers.editCat().then((data) => {
    res.render('admin/edit-cat-req', { adminLogin: true, data: data })
  })

})


router.get('/admin-verify', (req, res) => {
  res.render('admin/admin-verification')
})


router.get('/dashboard', async (req, res) => {
  let renderdata = {}
  if (req.session.adminloggedIn) {
    let daily_earning = await adminHelpers.dailyEarning()
    let payment_Data = await adminHelpers.getRevenue()
    let sales = await adminHelpers.dailySales()
    let users = await adminHelpers.totalUsers()

    renderdata.sales = sales
    renderdata.users = users
    renderdata.daily_earning = daily_earning,
      renderdata.payment_Data = payment_Data
    renderdata.adminLogin = true
    res.render('admin/admin-dashboard', renderdata)
  } else {
    res.redirect('/admin')
  }

})



//block category from newcat-req
// router.get('/block-cat/:id',(req,res)=>{
//   let catId = req.params.id
//   adminHelpers.blockCategory(catId).then((response)=>{
//     res.redirect('/admin/new-cat-req')
//   })
// })

//block(hold) category from new cat req
router.get('/hold-cat/:id', (req, res) => {
  let catId = req.params.id
  adminHelpers.blockCategory(catId).then((response) => {
    res.redirect('/admin/new-cat-req')
  })
})

//block category from active category
router.get('/block-cat/:id', adminloggedin, (req, res) => {
  let catId = req.params.id
  adminHelpers.blockCategory(catId).then((response) => {
    res.redirect('/admin/active-cat')
  })
})
//show blocked vendors
router.get('/blocked-ven', adminloggedin, (req, res) => {
  vendorHelpers.blockedven().then((data) => {
    res.render('admin/blocked-ven', { adminLogin: true, vendors: data })
  })
})
//unblock vendor s from blocked vendors
router.get('/unblock-ven/:id', adminloggedin, (req, res) => {
  let catId = req.params.id
  vendorHelpers.unblockVen(catId).then((response) => {
    res.redirect('/admin/blocked-ven')
  })
})


//block vendor  from active
router.get('/block-ven/:id', adminloggedin, (req, res) => {
  let catId = req.params.id
  vendorHelpers.blockVen(catId)
  res.redirect('/admin/active-ven')

})
// show all active vendors
router.get('/active-ven', (req, res) => {
  vendorHelpers.activeVen().then((data) => {
    res.render('admin/activeVen', { adminLogin: true, data: data })
  })
})

//show holded vendors
router.get('/holded-ven', (req, res) => {
  vendorHelpers.holdedVen().then((data) => {
    res.render('admin/hold-vendor', { adminLogin: true, vendors: data })
  })
})
//hold vendor 
router.get('/hold-ven/:id', (req, res) => {
  let venId = req.params.id
  adminHelpers.holdVen(venId).then((response) => {
    res.redirect('/admin/vendor-req')
  })
})
//update categories
router.get('/update-cat/:id/:editTo', (req, res) => {
  let catId = req.params.id
  let catName = req.params.editTo
  adminHelpers.updateCat(catId, catName).then((response) => {
    console.log(response);
    console.log(catName);
    res.redirect('/admin/edit-cat')
  })
})


//blocked category
router.get('/blocked-cat', adminloggedin, (req, res) => {
  adminHelpers.blockedCat().then((data) => {
    res.render('admin/blocked-cat', { adminLogin: true, data: data })
  })
})
//unblock category
router.get('/unblock-cat/:id', (req, res) => {
  let catId = req.params.id
  adminHelpers.unblockCat(catId).then((response) => {
    res.redirect('/admin/blocked-cat')
  })
})

//agree category from new cat req
router.get('/agree-cat/:id', (req, res) => {
  let catId = req.params.id
  adminHelpers.agreeCat(catId).then((response) => {
    res.redirect('/admin/new-cat-req')
  })
})

// agree category from holded categoty
router.get('/hagree-cat/:id', (req, res) => {
  let catId = req.params.id
  adminHelpers.agreeCat(catId).then((response) => {
    res.redirect('/admin/hold-cat')
  })
})


//active category
router.get('/active-cat', (req, res) => {
  adminHelpers.activeCategory().then((data) => {
    res.render('admin/active-cat', { adminLogin: true, data: data });
  })

})

// view products
router.get('/view-products', adminloggedin, (req, res) => {
  vendorHelpers.avlPro().then((data) => {
    console.log(data);
    res.render('admin/view-products', { adminLogin: true, data: data })
  })
})



router.post('/edit-category/:id', (req, res) => {
  console.log(req.body)
  adminHelpers.editCategory(req.params.id, req.body)
  res.redirect('/admin/dashboard')


})
router.post('/otpVerify', (req, res) => {
  sms.otpAdminVerify(req.body).then((data) => {
    if (data.valid) {
      // amdinHelper.doSignup(req.session.vendorDat).then((response)=>{
      // console.log(response);
      res.redirect('/admin/dashboard')

    } else {
      res.redirect('/vendor/vendor-verification')
    }
  })

})

var couponExist = false
router.get('/coupon', (req, res) => {
  couponExist = req.session.couponExist
  res.render('admin/coupon-create', { adminLogin: true, couponExist: couponExist })
  couponExist = false
})


router.post('/coupon', (req, res) => {

  vendorHelpers.addCoupon(req).then((response) => {
    if (response.couponExist) {
      req.session.couponExist = true
      res.redirect('/admin/coupon')
    } else {

      res.redirect('/admin/coupon');
    }
  })
})

// view all available coupons

router.get('/view-all-coupon', async (req, res) => {
  await adminHelpers.getAllCoupon().then((data) => {
    res.render('admin/view-coupons', { adminLogin: true, data: data })
  })

})


router.post('/dashboard', function (req, res) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  const { email, password } = req.body;
  if (email == emaildb && password == passworddb) {
    req.session.adminloggedIn = true

    res.redirect('/admin/dashboard');
    console.log('login successfull');

  } else {
    loginErr = true
    res.redirect("/admin")
    console.log('login error');
  }
})


router.post('/add-category', (req, res) => {
  adminHelpers.addCatagory(req.body)
  res.redirect('/admin/dashboard')
  console.log(req.body);
})

router.get('/delete-user/:id', (req, res) => {
  let userId = req.params.id
  console.log('userId')
  adminHelpers.deleteCategory(userId).then((response) => {
    res.redirect('/admin/dashboard')
  })


})

//vendor request

router.get('/vendor-req', (req, res) => {
  vendorHelpers.getallvendors().then((vendors) => {
    console.log(vendors);
    res.render('admin/vendor-req', { adminLogin: true, vendors: vendors })
  })

})


//admit vendor from vendor req
router.get('/admit-ven/:id', (req, res) => {
  let vendorId = req.params.id
  vendorHelpers.admitVendor(vendorId).then((response) => {
    res.redirect('/admin/vendor-req')
  })
})
// admit vendor from holded vendors
router.get('/admit-holded-ven/:id', (req, res) => {
  let vendorId = req.params.id
  vendorHelpers.admitVendor(vendorId).then((response) => {
    res.redirect('/admin/holded-ven')
  })
})

// router.get('/edit-user/:id',async(req,res)=>{
//   let user= await userHelper.getUserDetails(req.params.id)
//    console.log(user);
//   res.render('admin/edit-user',{user})
// })

router.post('/edit-user/:id', (req, res) => {
  adminHelpers.updatecategory(req.params.id, req.body).then(() => {
    res.redirect('/admin/users/')
  })
})


router.get('/logout', (req, res) => {

  req.session.adminloggedIn = false
  res.redirect('/admin')
})

router.get('/orders', async (req, res) => {
  let orderData = await adminHelpers.getOrderList()
  res.render('admin/orderList', { adminLogin: true, orderData: orderData })
})

router.get('/ordered_pro_details', (req, res) => {

  let { orderId, productId } = req.query

  // vendorHelper.orderedProDetails(proId).then((proDtails)=>{
  //   res.render('vendor/orderedProDetails',{proDtails:proDtails})
  // })
  userHelper.orderedProList(productId).then(async (proDetails) => {
    let orderData = await userHelper.orderDetails(orderId)
    res.render('vendor/orderedProDetails', { proDetails: proDetails, orderData: orderData })
  })
})

module.exports = router;

