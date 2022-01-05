const mongoose = require("mongoose")
const { UserModel } = require("./User")

const shirtSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  iconCode: Number,
})

const ShirtModel = mongoose.model("shirt", shirtSchema)

const Shirt = function (data) {
  this.data = data
}

Shirt.getShirts = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let shirt = await ShirtModel.find()
      resolve(shirt)
    } catch (err) {
      reject(err)
    }
  })
}

Shirt.getItem = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let item = await ShirtModel.findOne({ _id: id })
      resolve(item)
    } catch (err) {
      reject(err)
    }
  })
}

Shirt.prototype.randomizer = function () {
  randomNum = Math.floor(Math.random() * 2)
  if (randomNum == 0) {
    return { name: "White T-Shirt", iconCode: 1 }
  }
  if (randomNum == 1) {
    return { name: "Red T-Shirt", iconCode: 2 }
  }
  if (randomNum == 2) {
    return { name: "Blue T-Shirt", iconCode: 3 }
  }
}

Shirt.prototype.create = async function () {
  return new Promise(async (resolve, reject) => {
    let { name, iconCode } = this.randomizer()
    let shirt = new ShirtModel({
      name,
      price: 10,
      category: "shirts",
      iconCode,
    })
    try {
      await shirt.save()
      resolve(shirt)
    } catch (err) {
      reject(err)
    }
  })
}

Shirt.prototype.validate = function () {
  return new Promise(async (resolve, reject) => {
    let user = await UserModel.findOne({ _id: this.data.userID })
    let arr = []
    if (user.cart.length) {
      user.cart.forEach((item) => {
        // loops through cart array and looks for a match
        if (item._id == this.data.itemID) {
          arr.push(item)
        } else {
          return
        }
      })
      if (arr.length) {
        reject("Item is already in your cart")
      } else {
        resolve("Succes")
      }
    } else {
      resolve("Success")
    }
  })
}

Shirt.prototype.addToCart = function () {
  return new Promise(async (resolve, reject) => {
    try {
      await this.validate() //since it returns a promise, use await otherwise rejection will not push to catch block
      let user = await UserModel.findOne({ _id: this.data.userID }) //returns actual document as long as you say .save()
      let item = await ShirtModel.findOne({ _id: this.data.itemID })
      if (user && item) {
        // if user and item exists
        user.cart.push(item)
        await user.save()
        resolve(user)
      } else {
        reject("404 not found")
      }
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = Shirt
