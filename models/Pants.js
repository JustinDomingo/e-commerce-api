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
      iconCode: 3,
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
        if (item.name == this.data.itemName) {
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

Pants.addPants = function ({ user, item }) {
  const validate = (companyStock, userStock) => {
    if (userStock > companyStock - 1) {
      throw new Error("Not enough in stock.")
    }
  }

  const getStock = (arr) => {
    currentUserStock = []
    arr.forEach((_item) => {
      if (_item.name == item.name) {
        currentUserStock.push(item)
      }
    })
    console.log(currentUserStock)
    return currentUserStock.length
  }

  return new Promise(async (resolve, reject) => {
    try {
      let currentUser = await UserModel.findOne({ _id: user._id })
      let pants = await PantsModel.find({ name: item.name })
      let length = getStock(currentUser.cart)
      let test = pants[length]
      validate(pants.length, length)
      currentUser.cart.push(test)
      let doc = await currentUser.save()
      resolve(doc.cart)
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

Pants.subtractPants = function ({ user, item }) {
  return new Promise(async (resolve, reject) => {
    try {
      let currentUser = await UserModel.findOne({ _id: user._id })
      let array = currentUser.cart
      array.every((_item, index, object) => {
        if (_item.name === item.name) {
          object.splice(index, 1)
          return false
        } else {
          return true
        }
      })
      currentUser.cart = array
      let doc = await currentUser.save()
      resolve(doc.cart)
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

Pants.delete = function (idArray) {
  return new Promise(async (resolve, reject) => {
    let pants = await PantsModel.find()
    idArray.forEach((id) => {
      let num = pants.findIndex((item, index) => {
        if (item._id.toString() === id) {
          return true
        }
      })
      pants.splice(num, 1)
    })
    await PantsModel.deleteMany()
    let _pants = await PantsModel.insertMany(pants)
    resolve(_pants)
  })
}

module.exports = Pants
