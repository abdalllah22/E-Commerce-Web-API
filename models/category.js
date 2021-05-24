const mongoose = require('mongoose'); 


const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        default: ''
    },
    color: { 
        type: String,
        default: 'red'
    }

    
});


categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

const Category = mongoose.model('Category',categorySchema);
module.exports = Category;

//exports.Product = mongoose.model('Product',productSchema);