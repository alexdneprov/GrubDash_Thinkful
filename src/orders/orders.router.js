const router = require("express").Router();
const ordersController = require("./orders.controller");

router.route("/:orderId")
.get(ordersController.read)
.put(ordersController.update)
.delete(ordersController.destroy)
.all(methodNotAllowed);

router.route("/")
.get(ordersController.ordersList)
.post(ordersController.create)
.all(methodNotAllowed);

module.exports = router;
 