const Shirt = require("../models/Shirt")
const Pants = require("../models/Pants")
const { UserModel } = require("../models/User")

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
      res.status(201).json("Success")
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json("Failed")
    })
}

exports.addItem = (req, res) => {
  const data = { itemName: req.body.data.name, userID: req.body.user._id, itemID: req.body.data._id }
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

exports.addQuantity = async (req, res) => {
  console.log(req.body)
  if (req.body.item.category == "shirts") {
    try {
      let cart = await Shirt.addShirt(req.body)
      res.status(201).json(cart)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  if (req.body.item.category == "pants") {
    try {
      let result = await Pants.addPants(req.body)
      res.status(201).json(result)
    } catch (err) {
      console.log(err)
      res.status(500).json(err)
    }
  }
}

exports.subtractQuantity = async (req, res) => {
  console.log(req.body)
  if (req.body.item.category == "shirts") {
    try {
      let cart = await Shirt.subtractShirt(req.body)
      res.status(201).json(cart)
    } catch (err) {
      res.status(500).json(err)
    }
  }
  if (req.body.item.category == "pants") {
    try {
      let cart = await Pants.subtractPants(req.body)
      res.status(201).json(cart)
    } catch (err) {
      res.status(500).json(err)
    }
  }
}

exports.getTops = async (req, res) => {
  try {
    let shirts = await Shirt.getShirts()
    let results = Shirt.processShirts(shirts)
    res.status(201).json(results)
  } catch (err) {
    console.log(err)
    res.status(404).json(err)
  }
}

exports.getBottoms = async (req, res) => {
  try {
    let pants = await Pants.getPants()
    let results = Shirt.processShirts(pants)
    res.status(201).json(results)
  } catch (err) {
    console.log(err)
    res.status(404).json(err)
  }
}

exports.getQuantity = async (req, res) => {
  if (req.params.category == "shirts") {
    try {
      let cart = await Shirt.getQuantity(req.params.category, req.params.userid)
      res.status(201).json(cart)
    } catch (err) {
      res.status(500).json(err)
    }
  }
  // if (req.params.category == "pants") {
  //   try {
  //     let cart = await Pants.addShirt(req.body)
  //     res.status(201).json(cart)
  //   } catch (err) {
  //     res.status(500).json(err)
  //   }
  // }
}

exports.removeItems = async (req, res) => {
  let user = await UserModel.findOne({ _id: req.params.id })
  let shirts = user.cart.filter((item) => {
    return item.category === "shirts"
  })
  let pants = user.cart.filter((item) => {
    return item.category === "pants"
  })

  if (shirts.length) {
    let idArray = []
    shirts.forEach((item) => {
      idArray.push(item._id)
    })
    Shirt.delete(idArray).then(() => {
      res.send("success")
    })
  }

  if (pants.length) {
    let idArray = []
    pants.forEach((item) => {
      idArray.push(item._id)
    })
    Pants.delete(idArray).then(() => {
      res.send("success")
    })
  }
}

exports.getShirtsBySize = async (req, res) => {
  console.log(req.params.color)
  try {
    let shirts = await Shirt.getSpecificShirts(req.params.color)
    let sortedShirts = shirts.filter((item) => {
      return item.size == req.params.size
    })
    res.status(200).json(sortedShirts.length)
  } catch (err) {
    res.status(500).json(err)
  }
}
