const { query } = require('express')
const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({}).sort('-name price')
    res.status(200).json({ products, nbHits: products.length })
}
const getAllProducts = async (req, res) => {
    const { featured, company, name } = req.query //this is so that only properties exist in json is pass into the query
    const queryObject = {}
    //edit query params e.g.http://localhost:3000/api/v1/products?name=emperor%20bed&featured=false&company=ikea

    if (featured) {
        queryObject.featured = featured === 'true' ? true : false
    }
    if (company) {
        queryObject.company = company
    }
    if (name) {
        //https://www.mongodb.com/docs/manual/reference/operator/query/
        //$regex in mongoose means: Selects documents where values match a specified regular expression.
        //$options: 'i' means case insensitive
        queryObject.name = { $regex: name, $options: 'i' }
    }
    console.log(queryObject)

    const products = await Product.find((queryObject));
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProducts, getAllProductsStatic,
}