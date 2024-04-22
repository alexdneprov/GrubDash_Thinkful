const router = require("express").Router();
const dishesController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/:dishId").get(dishesController.read).put(dishesController.update).all(methodNotAllowed);
router.route("/").get(dishesController.dishesList).post(dishesController.createDish).all(methodNotAllowed);


module.exports = router;
