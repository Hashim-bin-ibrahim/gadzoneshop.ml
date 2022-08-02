

var couponArr = [];
var getcoupon = 10;
function validCheck(getcoupon,){
    if($.inArray(getcoupon, couponArr) !== -1) {
        console.log('Coupon already used, can\'t use again.');
    } else {
        couponArr.push(getcoupon);
        
    }
    

}

validCheck(getcoupon,couponArr);

console.log(couponArr);

