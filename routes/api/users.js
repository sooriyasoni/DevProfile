const express = require('express');
const gravatar = require('gravatar')
const router = express.Router();
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const { check, validationResult } = require('express-validator')

router.post('/', [
    check('name', 'name is required').not().isEmpty(),
    check('email', 'email is required').isEmail(),
    check('password', 'password is required').isLength({ min: 6 })

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password } = req.body
    try {
        //see if user exist
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
        }
        //get user gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })
        //encrypt the password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt)

        await user.save()
        //return jwt
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