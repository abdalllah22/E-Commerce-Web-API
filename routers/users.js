const User = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');



router.get('/',async (req,res)=>{
    const userlist = await User.find().select('-passwordHash');
    if(!userlist){
        res.status(500).json({
            success: false
        })
    }
    res.send(userlist);
})

router.get('/:id', async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invaild ID')
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user){
        res.status(500).json({
            success: false,
            message: 'the user with given ID was not found'
        })
    }
    res.status(200).send(user);
})

// for admin to create users
router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10), // slat can be number or string
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    
    user = await user.save();
    if (!user) {
        return res.status(404).send("the user cannot be created!");
    }
    return res.status(201).send({ message: 'new user created', data: user });    
});

router.post('/login', async (req,res)=>{
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;
    
    if(!user){
        return res.status(400).send('the email or password is wrong') 
    }
    
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign(
            {
                ueerId: user.id,
                isAdmin: user.isAdmin
            },
            secret, // can add here anything
            {
                expiresIn: '1w'
            }
        )
        res.status(200).send({
            message: 'user Authenticatd',
            user: user.email,
            token: token
        });
    } else {
        res.status(400).send('the email or password is wrong');
    }
})

// for users to register 
router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10), // slat can be number or string
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    
    user = await user.save();
    if (!user) {
        return res.status(404).send("the user cannot be created!");
    }
    return res.status(201).send({ message: 'new user created', data: user });    
});

router.get('/get/count',async (req,res)=>{
    const userCount = await User.countDocuments((count)=> count)
    if(!userCount){
        res.status(500).json({
            success: false
        })
    }
    res.send({
        count: userCount
    });
})

router.delete('/:id', async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invaild ID')
    }
    const user = await User.findByIdAndRemove(req.params.id)
    if(!user){
        res.status(500).json({
            success: false,
            message: 'the user with given ID was not found'
        })
    } else {
        return res.status(200).json({
            success: true,
            message: 'user is deleted'
        });
    }
    
})


module.exports = router;