const express = require("express")
const router = express.Router()
const itemController = require("./controllers/itemController")
const userController = require("./controllers/userController")

router.get("/", (req, res) => {
  res.json("Welcome to the API")
})

//fetching data routes
router.get("/items", itemController.getItems)
router.get("/cart/:id", userController.getCartItems)
router.get("/shirts", itemController.getShirts)
router.get("/shirts/:id", itemController.getShirt)
router.get("/pants", itemController.getPants)
router.get("/pants/:id", itemController.getSinglePants)

//creating new shirts (less tedious)
router.post("/create-shirt", itemController.createShirt)
router.post("/create-pants", itemController.createPants)

//user routes
router.post("/register", userController.register)
router.post("/login", userController.login)
router.delete("/logout", userController.logout)

//shopping cart routes
router.post("/add-item", itemController.addItem)

module.exports = router
