const Product = require('../models/product');
const express = require('express');
const Category = require('../models/category');

const mongoose = require('mongoose');
const router = express.Router();

const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        
        if(isValid) {
            uploadError = null
        }
        
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const extension = FILE_TYPE_MAP[file.mimetype];
        const fileName = file.originalname.replace(' ','-' );
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })


// before adding fliter
/*
router.get('/',async (req,res)=>{
    //const product = await Product.find().select('rating name -_id');
    const product = await Product.find().populate('category');
    if(!product){
        res.status(500).json({
            success: false
        })
    }
    res.send(product);
})
*/
// after adding fliter
router.get('/',async (req,res)=>{
    // http://localhost:3000/api/v1/products?categories=111,333
    let filter = {};
    if(req.query.categories)
    {
        filter = {
                    category: req.query.categories.split(','),
                }
    }
    
    //const product = await Product.find().select('rating name -_id');
    const product = await Product.find(filter).populate('category');
    if(!product){
        res.status(500).json({
            success: false
        })
    }
    res.send(product);
})

router.get('/:id', async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invaild ID')
    }
    // choose specific field and return all data with this field
    //const product = await Product.find().select('rating name -_id');
    const product = await Product.findById(req.params.id).populate('category')
    if(!product){
        res.status(500).json({
            success: false,
            message: 'the product with given ID was not found'
        })
    }
    res.status(200).send(product);
})

router.put('/:id',  async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invaild ID')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invaild Category')
    
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true}
    );
    if (!product) {
        return res.status(404).send("the product cannot be updated!");
    }
    res.send(product);

})

router.post('/', uploadOptions.single('image') ,async (req,res)=>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invaild Category')

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request')

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    const product =  new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,      // "http://localhost:3000/public/uploads/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })
    const createdProduct = await product.save();
    if (createdProduct) {
        return res
            .status(201)
            .send({ message: 'new product created', data: createdProduct });
    }
    return res.status(500).send({ message: ' Error in Creating Product.' });
    
    // .then((createdProduct)=>{
    //     res.status(201).json(createdProduct)
    // }).catch((err)=>{
    //     res.status(500).json({
    //         error: err,
    //         success: false
    //     })
    // })
    
    
    
})

router.delete('/:id', async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invaild ID')
    }
    const product = await Product.findByIdAndRemove(req.params.id)
    if(!product){
        res.status(500).json({
            success: false,
            message: 'the product with given ID was not found'
        })
    } else {
        return res.status(200).json({
            success: true,
            message: 'category is deleted'
        });
    }
    
})

router.get('/get/count',async (req,res)=>{
    const productCount = await Product.countDocuments((count)=> count)
    if(!productCount){
        res.status(500).json({
            success: false
        })
    }
    res.send({
        count: productCount
    });
})

router.get('/get/featured/:count',async (req,res)=>{
    const count = req.params.count ? req.params.count : 0 
    const products = await Product.find({isFeatured: true}).limit(+count)
    if(!products){
        res.status(500).json({
            success: false
        })
    }
    res.send(products);
})

router.get('/get/search', async (req, res) => {
    const searchField = req.query.name;
    const product = await Product.find({name: {$regex: searchField, $options: '$i'}})
    if(!product){
        res.status(500).json({
            success: false
        })
    }
    res.send(product);
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const files = req.files
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if(files) {
        files.map(file =>{
            imagesPaths.push(`${basePath}${file.filename}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true}
    )

    if(!product){
        return res.status(500).send('the gallery cannot be updated!')
    }
    
    res.send(product);
});    


module.exports = router;