const express = require('express');
const auth = require('../middlewares/auth');
const Order = require('../models/order');
const { Product } = require('../models/product');
const User = require('../models/user');

const userRouter = express.Router();

userRouter.post('/api/add-to-cart', auth, async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Product.findById(id);
        let user = await User.findById(req.user);

        if (user.cart.length == 0) {
            user.cart.push({ product, quantity: 1 });
        } else {
            let isProductFound = false;
            for (let i = 0; i < user.cart.length; i++) {
                if (user.cart[i].product._id.equals(product._id)) {
                    isProductFound = true;
                    break;
                }
            }

            if (isProductFound) {
                let cartItem = user.cart.find((item) =>
                    item.product._id.equals(product._id)
                );
                cartItem.quantity += 1;
            } else {
                user.cart.push({ product, quantity: 1 });
            }
        }

        user = await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.delete('/api/remove-from-cart/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        let user = await User.findById(req.user);

        for (let i = 0; i < user.cart.length; i++) {
            if (user.cart[i].product._id.equals(product._id)) {
                if (user.cart[i].quantity == 1) {
                    user.cart.splice(i, 1);   // Start removing from i and delete 1 item
                } else {
                    user.cart[i].quantity -= 1;
                }
                break;
            }
        }

        user = await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/save-user-address', auth, async (req, res) => {
    try {
        const { address } = req.body;
        let user = await User.findById(req.user);
        user.address = address;
        user = await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/place-order', auth, async (req, res) => {
    try {
        const { cart, address, totalPrice } = req.body;
        let products = [];

        for (let i = 0; i < cart.length; i++) {
            let product = await Product.findById(cart[i].product._id);
            if (product.quantity >= cart[i].quantity) {
                product.quantity -= cart[i].quantity;
                products.push({ product, quantity: cart[i].quantity });
                await product.save();
            } else {
                return res.status(400).json({ message: `${product.name} is out of stock!` });
            }
        }

        let user = await User.findById(req.user);
        user.cart = [];
        user = await user.save();

        let order = new Order({
            products,
            totalPrice,
            address,
            userId: req.user,
            orderedAt: new Date().getTime(),
        });
        order = await order.save();
        res.status(200).json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.get('/api/orders/me', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user });
        res.status(200).json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = userRouter;