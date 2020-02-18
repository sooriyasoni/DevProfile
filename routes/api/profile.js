const express = require('express');
const router = express.Router()

const Profile = require('../../models/Profile');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({ msg: 'PRofile not found' })
        }
        res.json(profile)
    } catch (err) {
        res.status(500).json({ msg: "server error", err })
    }
})

//post req to update and create a profile

router.post('/',
    [
        auth,
        [
            check('status', 'status is reuired').not().isEmpty(),
            check('skills', 'skills required').not().isEmpty()
        ]
    ], async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log('here')
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        const profileFields = {}
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername
        if (skills) {
            console.log('123');
            profileFields.skills = skills.split(',').map(skills => skills.trim())
        }
        //build social array 
        profileFields.social = {}
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (youtube) profileFields.social.youtube = youtube;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (facebook) profileFields.social.facebook = facebook;

        try {
            let profile = await Profile.findOne({ user: req.user.id })
            if (profile) {
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, { $set: profileFields }, { new: true })
                return res.json(profile)
            }

            //create if not found 
            profile = new Profile(profileFields)
            await profile.save()
            return res.json(profile)
        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: 'error in catch', err });
        }
    }
);

//@route : GET api/profile
//@desc Get all profile
//@access public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.send(profiles)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ msg: 'Server error' })
    }
})

//@route : GET api/profile/user/:user_id
//@desc Get profile by user id
//@access public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({ msg: 'no profile for this user' })
        }
        return res.send(profile)
    } catch (err) {
        console.log(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'no profile for this user' })
        }
        res.status(500).json({ msg: 'Server error' })
    }
})


//@route : Delete api/profile
//@desc delete  profile,user &post
//@access private

router.delete('/', auth, async (req, res) => {
    try {
        //todo remove users posts


        //remove profile
        await Profile.findOneAndRemove({ user: req.user.id })
        await User.findOneAndDelete({ _id: req.user.id })
        res.json({ msg: 'removed successfully' })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ msg: 'Server error' })
    }
})
//@route : put api/profile/experience
//@desc add profile experience
//@access private

router.put('/experience', [
    auth,
    [
        check('title', 'title is required').not().isEmpty(),
        check('company', 'company is required').not().isEmpty(),
        check('from', 'from is required').not().isEmpty()
    ]
], async (req, res) => {
    // console.log('I am here', req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        var profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
        profile.experience.unshift(newExp);
        await profile.save()
        console.log('here you dumb', profile)
        return res.send(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ msg: 'Server error' })
    }
}
)

//@route : delete api/profile/experience
//@desc delete profile experience
//@access private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        //remove profile
        const profile = await Profile.findOne({ user: req.user.id })
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)
        console.log('indexx', removeIndex);
        console.log('proffff', profile.experience)
        profile.experience.splice(removeIndex, 1)
        await profile.save()
        // await User.findOneAndDelete({ _id: req.user.id })
        res.json({ msg: 'removed successfully', profile })
    } catch (err) {
        console.log('err', err)
        res.status(500).json({ msg: 'Server error' })
    }
})

//@route : PUT api/profile/education
//@desc add education 
//@access private

router.put('/education', [
    auth,
    [
        check('school', 'school is required').not().isEmpty(),
        check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
        check('degree', 'from is required').not().isEmpty(),
        check('from', 'from is required').not().isEmpty(),
        check('to', 'from is required').not().isEmpty()
    ]
], async (req, res) => {
    // console.log('I am here', req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({ errors: errors.array() })
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        var profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
        profile.education.unshift(newEdu);
        await profile.save()
        console.log('here you dumb', profile)
        return res.send(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ msg: 'Server error' })
    }
}
)

//@route : delete api/profile/eductaion
//@desc delete profile educaion
//@access private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        //remove profile
        const profile = await Profile.findOne({ user: req.user.id })
        const removeIndex = profile.education.map(item => item._id).indexOf(req.params.edu_id)
        console.log('indexx', removeIndex);

        profile.education.splice(removeIndex, 1)
        await profile.save()
        console.log('proffff', profile.education)
        // // await User.findOneAndDelete({ _id: req.user.id })
        res.json({ msg: 'removed successfully', profile })
    } catch (err) {
        console.log('err', err)
        res.status(500).json({ msg: 'Server error' })
    }
})
module.exports = router

