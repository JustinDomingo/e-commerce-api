const mongoose = require("mongoose")
const { UserModel } = require("./User")

const pantsSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  iconCode: Number,
})

const PantsModel = mongoose.model("pant", pantsSchema)

const Pants = function (data) {
  this.data = data
}

Pants.getPants = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let pants = await PantsModel.find()
      resolve(pants)
    } catch (err) {
      reject(err)
    }
  })
}

Pants.getItem = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let item = await PantsModel.findOne({ _id: id })
      resolve(item)
    } catch (err) {
      reject(err)
    }
  })
}

Pants.prototype.create = async function () {
  return new Promise(async (resolve, reject) => {
    let pants = new PantsModel({
      name: "Jeans",
      price: 20,
      category: "pants",
      iconCode: 4,
    })
    try {
      await pants.save()
      resolve(pants)
    } catch (err) {
      reject(err)
    }
  })
}

Pants.prototype.validate = function () {
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
        resolve("Success")
      }
    } else {
      resolve("Success")
    }
  })
}

Pants.prototype.addToCart = function () {
  return new Promise(async (resolve, reject) => {
    try {
      await this.validate()
      let user = await UserModel.findOne({ _id: this.data.userID }) //returns actual document as long as you say .save()
      let item = await PantsModel.findOne({ _id: this.data.itemID })
      if (user && item) {
        // if user and item exists
        user.cart.push(item)
        await user.save()
        resolve(user)
      } else {
        reject("404")
      }
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

module.exports = Pants
