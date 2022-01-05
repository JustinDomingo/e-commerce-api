const Shirt = require("../models/Shirt")
const Pants = require("../models/Pants")

exports.getItems = async (req, res) => {
  try {
    let shirts = await Shirt.getShirts()
    let pants = await Pants.getPants()
    let items = { shirts, pants }
    res.status(201).json(items)
  } catch {
    res.status(500).json(err)
  }
}

exports.getShirt = async (req, res) => {
  Shirt.getItem(req.params.id)
    .then((item) => {
      res.status(201).json(item)
    })
    .catch((err) => {
      res.status(404).json(err)
    })
}

exports.getShirts = async (req, res) => {
  Shirt.getShirts()
    .then((shirts) => {
      res.status(201).json(shirts)
    })
    .catch((err) => {
      res.status(404).json(err)
    })
}

exports.getSinglePants = async (req, res) => {
  Pants.getItem(req.params.id)
    .then((item) => {
      res.status(201).json(item)
    })
    .catch((err) => {
      res.status(404).json("Failed")
    })
}

exports.getPants = async (req, res) => {
  Pants.getPants()
    .then((pants) => {
      res.status(201).json(pants)
    })
    .catch((err) => {
      res.status(404).json("Failed")
    })
}

exports.createShirt = (req, res) => {
  let shirt = new Shirt()
  shirt
    .create()
    .then((item) => {
      console.log(item)
      res.status(201).json("Success")
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json("Failed")
    })
}

exports.createPants = (req, res) => {
  let pants = new Pants()
  pants
    .create()
    .then((item) => {
      console.log(item)
      res.status(201).json("Success")
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json("Failed")
    })
}

exports.addItem = (req, res) => {
  const data = { itemID: req.body.data._id, userID: req.body.user._id }
  console.log(data)
  if (req.body.data.category == "shirts") {
    let shirt = new Shirt(data)
    shirt
      .addToCart()
      .then((item) => {
        res.status(201).json(item.cart)
      })
      .catch((err) => {
        res.status(500).json(err)
      })
  }
  if (req.body.data.category == "pants") {
    let pants = new Pants(data)
    pants
      .addToCart()
      .then((item) => {
        res.status(201).send(item.cart)
      })
      .catch((err) => {
        res.status(500).json(err)
      })
  }
}
