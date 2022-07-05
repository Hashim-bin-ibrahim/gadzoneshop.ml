// add to cart ajax
function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {

                $('#cart-count').load(`${location.href} #cart-count`)
                // let count = $('#cart-count').html()
                // count =parseInt(count)+1
                // $("#cart-count").html(count)
            }

        }
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
                // $(`#cart-row${proId}`).remove()

                $('#cartContainer').load(`${location.href} #cartContainer`)
            } else {
                const UpdatedQuantity = quantity + count
                document.getElementById(`quantity${proId}`).innerHTML = UpdatedQuantity
                console.log(UpdatedQuantity);
                const price = parseInt(proPrice)
                console.log(price);
                const total = proPrice * UpdatedQuantity

                document.getElementById(`total${proId}`).innerHTML = total

                const subTotal = parseInt(document.getElementById('subTotal').innerHTML)
                if (count === 1) {
                    document.getElementById('subTotal').innerHTML = subTotal + price
                } if (count === -1 && quantity !== 1) {
                    document.getElementById('subTotal').innerHTML = subTotal - price
                }






            }
        }
    })
}