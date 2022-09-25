const { query } = require('express')
const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({})
    res.status(200).json({ products, nbHits: products.length })
}
const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query //this is so that only properties exist in json is pass into the query
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

    if (numericFilters) {
        //https://www.mongodb.com/docs/manual/reference/operator/query/

        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }
        const regEx = /\b(<|>|>=|=|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)
        console.log(filters)
        //e.g. http://localhost:3000/api/v1/products?numericFilters=price%3E40,ratings%3E=4
        //console log will print "price-gt-40,ratings-$gte-4"

        const options = ['price', 'rating'];
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-')
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) }
            }
        })
    }

    // console.log(queryObject)
    let result = Product.find(queryObject);

    //sort
    if (sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList)

        //e.g. http://localhost:3000/api/v1/products?sort=-name
    }
    else {
        result = result.sort('createAt');
    }

    if (fields) {
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList)

        //e.g. http://localhost:3000/api/v1/products?fields=company,rating
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    //e.g. http://localhost:3000/api/v1/products?sort=name&limit=4
    //e.g. http://localhost:3000/api/v1/products?sort=name&limit=2&page=2

    result = result.skip(skip).limit(limit)

    const products = await result;
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
    getAllProducts, getAllProductsStatic,
}