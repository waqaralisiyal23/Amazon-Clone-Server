const express = require('express');
const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');

const authRouter = express.Router();

// SIGN UP
authRouter.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with same email already exists!' });
        }

        const hashedPassword = await bcryptjs.hash(password, 8);

        let user = new User({ name, email, password: hashedPassword });
        user = await user.save();
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// SIGN IN
authRouter.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist!' });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password.' });
        }

        const token = jwt.sign({ id: user._id }, 'passwordKey');
        res.status(200).json({ token, ...user._doc });   // ... => Object Destructuring
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Check If Token Is Valid
authRouter.post('/tokenIsValid', async (req, res) => {
    try {
        const token = req.header('x-auth-token');

        if (!token) return res.status(200).json(false);
        const verified = jwt.verify(token, 'passwordKey');
        if (!verified) return res.status(200).json(false);

        const user = await User.findById(verified.id);
        if (!user) return res.status(200).json(false);
        res.status(200).json(true);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get User Data
authRouter.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        res.status(200).json({ ...user._doc, token: req.token });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = authRouter;