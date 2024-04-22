const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

function ordersList (req,res) {
    res.json({data: orders});
}

function createOrder (req,res) {
    const {data: {deliverTo,mobileNumber,status,dishes} = {} } = req.body;

    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: dishes,
    }

    orders.push(newOrder);
    res.status(201).json({data: newOrder});
}

function read (req,res) {
    res.json({data: res.locals.order});
}

function orderExists (req,res,next) {
    const {orderId} = req.params;

    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        next();
    }

    next({
        status: 404,
        message: `Dish with ID: ${orderId} is not found`,
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
            message: `Order must include a ${propertyName}`,
        })
    }
}

function validDishes(req, res, next) {
    const { data: { dishes } = {} } = req.body;

    if (!Array.isArray(dishes) || dishes.length === 0) {
        return next({
            status: 400,
            message: "dish array is empty or not provided",
        });
    }

    for (let index = 0; index < dishes.length; index++) {
        const dish = dishes[index];
        if (!dish.hasOwnProperty('quantity') || typeof dish.quantity !== 'number' || !Number.isInteger(dish.quantity) || dish.quantity <= 0) {
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`,
            });
        }
    }

    next();
}

function update (req,res) {
    const order = res.locals.order;
    const {data: {deliverTo,mobileNumber,status,dishes} = {} } = req.body;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({data: order});

}

function validId (req,res,next) {
    const {data: {id} = {} } = req.body;
    const orderId = Number(req.params.orderId);

    if(id == orderId || !id) {
        return next();
    }

    next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
}

function validStatus (req,res,next) {
    const {data: {status} = {} } = req.body;
    const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];

    if(validStatus.includes(status)) {
        next();
    }

    next({
        status: 400,
        message: `$status ${status} property is invalid`,
    })
}

function validPendingStatus(req, res, next) {
    const order = res.locals.order;
    const validStatus = "pending";

    if (validStatus === order.status) {
        next();
    } else {
        next({
            status: 400,
            message: `Order with status ${order.status} cannot be deleted, expected status: ${validStatus}`,
        });
    }
}

function destroy (req,res) {
    const {orderId} = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));

    const destroyed = orders.splice(index,1);
    res.sendStatus(204);
}

module.exports = {
    ordersList,

    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),       
        bodyDataHas("dishes"),
        validDishes,
        createOrder,
    ],

    read: [
        orderExists,
        read,
    ],

    update: [
        orderExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),       
        bodyDataHas("dishes"),
        validDishes,
        validStatus,
        validId,
        update,
    ],

    destroy: [
        orderExists,
        validPendingStatus,
        destroy,
    ],
}
 