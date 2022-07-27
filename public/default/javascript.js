
// add to cart ajax
function addToCart(proId) {

    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.stockOut) {

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'error',
                    title: 'Product out of stock'
                })
                $('#cart-count').load(`${location.href} #cart-count`)
            }
            if (response.status) {


                $('#cart-count').load(`${location.href} #cart-count`)
            }

        }
    })
}




function addToWishlist(proId) {

    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'get',
        success: (response) => {
            if (response.stockOut) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'error',
                    title: 'Product out of stock'
                })
                window.location.reload();
            }
            if (response.status) {


                window.location.reload();
            }

        }
    })
}

// getting couponCode value from input field (radio button) and assign it to a hidden input field id
function myFunction(browser, couponValue) {
    document.getElementById("result").value = browser;
    document.getElementById('coupon_values').innerText = couponValue

}


function addCoupon() {
    let couponCode = document.getElementById('result').value
    let subtotal = document.getElementById('cart_subtotal').value
    let couponValue = document.getElementById('coupon_values').innerText


    $.ajax({
        url: '/couponCheck',
        method: 'post',
        data: {
            couponCode: couponCode,
            subtotal: subtotal,
            date: new Date()
        },
        success: (response) => {

            if (response.couponAccess) {
                // coupon applied alert
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Coupon Applied Successfully'
                })

                document.getElementById('couponDiscount').innerHTML = couponValue
                const grandTotal = subtotal - couponValue
                document.getElementById('grandTotal').innerText = grandTotal
                document.getElementById('hiddenGrandTotal').value = grandTotal
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'error',
                    title: 'Invalid coupon'
                })
                document.getElementById('couponDiscount').innerHTML = "0.00"
            }
        }
    })
}

function removeCoupon() {
    let subtotal = document.getElementById('cart_subtotal').value
    let couponValue = parseInt(0.00)
    document.getElementById('couponDiscount').innerHTML = "0.00"
    const grandTotal = subtotal - couponValue

    document.getElementById('grandTotal').innerText = grandTotal
    document.getElementById('hiddenGrandTotal').value = grandTotal
    // coupon removed alert 
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    Toast.fire({
        icon: 'success',
        title: 'Coupon Removed'
    })

}

//dd to wish list

// function addToCart(proId) {
//     $.ajax({
//         url: '/add-to-cart/' + proId,
//         method: 'get',
//         success: (response) => {
//             if (response.status) {

//                 $('#cart-count').load(`${location.href} #cart-count`)
//                 // let count = $('#cart-count').html()
//                 // count =parseInt(count)+1
//                 // $("#cart-count").html(count)
//             }

//         }
//     })
// }

function changeQuantity(cartId, proId, count, proPrice, action) {
    let quantity
    if (action === 'update') {
        quantity = parseInt(document.getElementById(`quantity${proId}`).innerText)
    } if (action === 'delete') {
        quantity = 1
    }
    count = parseInt(count)


    $.ajax({
        url: '/change-product-quantity',
        data: {
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {

            if (response.removeProduct) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Product Removed From Cart'
                })
                $('#cartContainer').load(`${location.href} #cartContainer`)
                $('#cart-count').load(`${location.href} #cart-count`)

            } else {
                const UpdatedQuantity = quantity + count
                document.getElementById(`quantity${proId}`).innerHTML = UpdatedQuantity

                const price = parseInt(proPrice)
                const total = proPrice * UpdatedQuantity

                document.getElementById(`total${proId}`).innerHTML = total

                const subTotal = parseInt(document.getElementById('subTotal').innerHTML)
                if (count === 1) {
                    document.getElementById('subTotal').innerHTML = subTotal + price
                    $('#div_subtotal').load(`${location.href} #div_subtotal`)

                    var subtotal = document.getElementById(subTotal).innerText
                    document.getElementById('subtotalAmount').value = subtotal.value
                } if (count === -1 && quantity !== 1) {
                    document.getElementById('subTotal').innerHTML = subTotal - price
                    $('#div_subtotal').load(`${location.href} #div_subtotal`)

                    var subtotal = document.getElementById(subTotal).innerText
                    document.getElementById('subtotalAmount').value = subtotal.value
                }







            }
        }
    })
}

function changeQuantityNum(proId, count) {
    quantity = parseInt(document.getElementById(`quantityCount${proId}`).value)

    count = parseInt(count)

    $.ajax({
        url: '/quantity-change',
        data: {
            productId: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {

            if (quantity == 1 && count == -1) {

                const UpdatedQuantity = quantity

                document.getElementById(`quantityCount${proId}`).value = UpdatedQuantity


            } else {
                const UpdatedQuantity = quantity + count

                document.getElementById(`quantityCount${proId}`).value = UpdatedQuantity
            }

        }
    })
}





// const $form3 = $('#save-address')
// $form3.on('submit', submitHandler)

// function submitHandler(e) {
//     e.preventDefault()
//     $.ajax({
//         url: '/save-address',
//         method: "POST",
//         data: $form3.serialize(),
//         success: (response) => {
//             alert("hiiiiiiiii")

//             if (response.status) {
//                 alert('new addresss added')
//                 location.href = '/order'
//             } else {

//             }


//         }
//     })
// }



const $form3 = $('#save-address')
$form3.on('submit', submitHandler)

function submitHandler(e) {
    e.preventDefault()
    $.ajax({

        url: '/save-address',
        method: "POST",
        data: $form3.serialize(),

        success: (response) => {
            if (response.addressExist) {

                sweetAlert("Oops...", "Sorry, your address limit has been exceeded Choose any one from the list above!", "error");


            } else {

                $('#address-show').load(`${location.href} #address-show`)

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Address Saved'
                })


            }


        }
    })
}


function packedOrder(orderId, productId) {

    $.ajax({
        url: location.origin + "/vendor/status_packed",
        method: 'POST',
        data: {
            order_Id: orderId,
            product_Id: productId,
        },


        success: (response) => {
            if (response.status) {
                window.location.reload();
            }

        }

    })
}


function shippedOrder(orderId, productId) {

    $.ajax({
        url: location.origin + "/vendor/status_shipped",
        method: 'POST',
        data: {
            order_Id: orderId,
            product_Id: productId,
        },


        success: (response) => {
            if (response.status) {
                window.location.reload();
            }

        }

    })
}

function deliveredOrder(orderId, productId) {

    $.ajax({
        url: location.origin + "/vendor/status_delivered",
        method: 'POST',
        data: {
            order_Id: orderId,
            product_Id: productId,
        },


        success: (response) => {
            if (response.status) {
                window.location.reload();
            }

        }

    })
}


function cancelOrder(orderId, productId) {

    $.ajax({
        url: "/vendor/status_cancelled",
        method: 'POST',
        data: {
            order_Id: orderId,
            product_Id: productId,
        },


        success: (response) => {
            if (response.status) {
                window.location.reload();
            }

        }

    })
}






// filter starts

function brandFilter(brand_name) {
    $.ajax({
        url: '/band_filter/' + brand_name,
        method: 'get',
        success: (response) => {
            if (response.stockOut) {

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'error',
                    title: 'Product out of stock'
                })
                $('#cart-count').load(`${location.href} #cart-count`)
            }
            if (response.status) {


                $('#cart-count').load(`${location.href} #cart-count`)
            }

        }
    })

}


function delete_Product(proId) {
    $.ajax({
        url: '/delete_product_from_wishlist/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Product removed successfully'
                })
                $('#wish_list_Container').load(`${location.href} #wish_list_Container`)
            }
            if (response.productExist) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Product alredy exist in your cart'
                })
                $('#wish_list_Container').load(`${location.href} #wish_list_Container`)

            }


        }
    })

}
