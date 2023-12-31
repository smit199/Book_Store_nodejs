const mongoose = require('mongoose');
const userModel = require('./../models/userModel');

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    cartItems: {
        type: [{
            _id: false,
            book: {
                type: mongoose.Types.ObjectId,
                ref: 'Books',
                required: true,
            },
            quantity: {
                type: Number,
                required: [true, "Provide book purchase quantity"],
            },
            addedOn: {
                type: Date,
                default: new Date(),
            },
        }],
        required: true,
    },
    cartTotal: {
        type: Number,
        // required: true,
    },
    createdOn: {
        type: Date,
        default: new Date(),
    },
    updatedOn: {
        type: Date,
        default: new Date(),
    }
});

cartSchema.pre('save', async function(next) {
    const cart = await this.populate('cartItems.book', 'price');
    let cartTotal = 0;
    cart.cartItems.forEach(item => {
        cartTotal += item.quantity * item.book.price;
    });
    this.cartTotal = cartTotal;
    next();
})

// cartSchema.post('save', async function(next) {
//     const user = await userModel.findById(this.user);
//     // const userCarts = user.carts;
//     user.carts.push(this._id);
//     const isSaved = await user.save();
//     console.log(isSaved);
//     next();
// });

const Cart = mongoose.model('Carts', cartSchema);
module.exports = Cart;