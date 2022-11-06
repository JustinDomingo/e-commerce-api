const express = require("express")
const router = express.Router()
const itemController = require("./controllers/itemController")
const userController = require("./controllers/userController")

router.get("/", (req, res) => {
  res.json("Welcome to the API of 'Fabrix'")
})

//fetching data routes
router.get("/user/:id", userController.getUser)
router.get("/items", itemController.getItems)
router.get("/cart/:id", userController.getCartItems)
router.get("/shirts", itemController.getShirts)
router.get("/shirts/:id", itemController.getShirt)
router.get("/shirts/sizes/:color/:size", itemController.getShirtsBySize)
router.get("/pants", itemController.getPants)
router.get("/pants/:id", itemController.getSinglePants)
router.get("/tops", itemController.getTops) // gets just one of each item
router.get("/bottoms", itemController.getBottoms)
router.get("/get-quantity/:category/:userid", itemController.getQuantity)

//creating new items (less tedious)
router.post("/shirts", itemController.createShirt)
router.post("/pants", itemController.createPants)

//user routes
router.post("/register", userController.register)
router.post("/login", userController.login)
router.delete("/logout", userController.logout)
router.route("/update-address/:userid").put(userController.updateAddress).delete(userController.deleteAddress)

//shopping cart routes
router.post("/items", itemController.addItem)
router.post("/quantity", itemController.addQuantity)
router.delete("/quantity", itemController.subtractQuantity)
router.delete("/cart/:id", userController.clearCartItems)
router.delete("/items/:id", itemController.removeItems)

module.exports = router
