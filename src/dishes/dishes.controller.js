const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const { stat } = require("fs");


function dishesList (req,res) {
    res.json({data: dishes});
}

function createDish (req,res) {
    const {data: {name,description,price,image_url} = {} } = req.body;

    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    }

    dishes.push(newDish);
    res.status(201).json({data: newDish});
}

function read (req,res) {
    res.json({data: res.locals.dish});
}

function update (req,res) {
    const dish = res.locals.dish;
    const {data: {name,description,price,image_url} = {} } = req.body;

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({data: dish});

}

function dishExists (req,res,next) {
    const {dishId} = req.params;

    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        next();
    }

    next({
        status: 404,
        message: `Dish with ID: ${dishId} is not found`,
    })

}

function bodyDataHas (propertyName) {
    return function (req,res,next) {
        const {data = {} } = req.body;
        if(data[propertyName] || !data[propertyName] === "") {
            return next();
        }
        next({
            status: 400,
            message: `Dish must include a ${propertyName}`,
        })
    }
}

function validPrice (req,res,next) {
    const {data: {price} = {} } = req.body;
    if(price <= 0 || !Number.isInteger(price)) {
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`,
        })
    }

    next();
}

function validId (req,res,next) {
    const {data: {id} = {} } = req.body;
    const dishId = Number(req.params.dishId);

    if(id == dishId || !id) {
        return next();
    }

    next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
}

module.exports = {
    dishesList,

    read: [
        dishExists,
        read,
    ],

    createDish: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validPrice,
        createDish,
    ],

    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validPrice,
        validId,
        update,
    ]

}