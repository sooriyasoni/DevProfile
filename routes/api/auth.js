const express = require('express');
const auth = require('../../middleware/auth')
const router = express.Router()
const User = require('../../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const { check, validationResult } = require('express-validator')

//auth route
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')

        if (user) {
            return res.status(200).json({ msg: 'Tokein authorized', user })
        }

    } catch (err) {
        res.status(401).json({ msg: "token is invalid", err })
    }
})

//login route
router.post('/', [
    check('email', 'email is required').isEmail(),
    check('password', 'password is required').exists()

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        //see if user exist
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
        }
        //return jwt
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(401).json({ msg: 'Invalid credentials' })
        }
        const payload = {
            user: {
                id: user.id,
            }
        }
        jwt.sign(payload, config.get('jwtToken'), { expiresIn: 360000 }, (err, token) => {
            console.log('token', token)
            res.json({ token })
        }
        );
    } catch (err) {
        console.log('from catch', err.message)
        res.status(500).send('Server Error', err)
    }
})
module.exports = router 