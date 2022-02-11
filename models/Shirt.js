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
  this.errors = []
  this.stock = 0
  this.shirts = []
  this.specificShirts = []
  this.cart = []
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

Shirt.processShirts = function (arr) {
  //reusable
  let previousItem = ""
  let newArr = []

  arr.sort((a, b) => {
    let nameA = a.name.toLowerCase()
    let nameB = b.name.toLowerCase()
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    return 0
  })

  arr.forEach((item) => {
    if (item.name != previousItem) {
      newArr.push(item)
      previousItem = item.name
      return
    }
    if (item.name == previousItem) {
      previousItem = item.name
    }
  })

  return newArr
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
    let errorArr = []
    if (user.cart.length) {
      user.cart.forEach((item) => {
        // loops through cart array and looks for a match
        if (item.name == this.data.itemName) {
          errorArr.push(item)
        } else {
          return
        }
      })
      if (errorArr.length) {
        reject("Item is already in your cart")
      } else {
        resolve("Success")
      }
    } else {
      resolve("Success")
    }
  })
}

Shirt.prototype.quantityValidate = function () {
  if (this.data.num > this.stock) {
    this.errors.push("Not enough in stock.")
  }
}

Shirt.prototype.getStock = function () {
  return new Promise(async (resolve, reject) => {
    try {
      this.shirts = await ShirtModel.find()
      let specificShirts = this.shirts.filter((item) => {
        return item.name === this.data.item.name
      })
      this.stock = specificShirts.length
      this.specificShirts = specificShirts
      resolve(this.stock)
    } catch (err) {
      reject(err)
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
      console.log(err)
      reject(err)
    }
  })
}

Shirt.prototype.updateQuant = function () {
  return new Promise(async (resolve, reject) => {
    await this.getStock()
    this.quantityValidate()
    if (!this.errors.length) {
      let copy = this.specificShirts
      let num = this.data.num
      let user = await UserModel.findOne({ _id: this.data.user._id })
      //console.log(this.data)
      let array = user.cart.filter((item) => {
        return item.name === this.data.item.name
      })

      console.log(array)

      if (this.data.num > array.length) {
        while (this.data.num != array.length) {
          this.cart.push(copy[num])
          num -= 1
        }

        this.cart.forEach((item) => {
          user.cart.push(item)
        })
      }
      if (this.data.num < array.length) {
        while (this.data.num != array.length) {
          array.pop()
        }
        user.cart = array
      }
      //await user.save()
    } else {
      reject(this.errors)
    }
  })
}

Shirt.addShirt = function ({ user, item }) {
  const validate = (companyStock, userStock) => {
    if (userStock > companyStock - 1) {
      throw new Error("Not enough in stock.")
    }
  }

  const checkDuplicate = (cart, whiteShirts) => {
    let specificCart = cart.filter((item) => {
      return item.name === "White T-Shirt"
    })
    let shirt = whiteShirts[specificCart.length] //filter cart by name otherwise it will take into account of length of cart including other items
    cart.push(shirt)
  }

  const getStock = (arr) => {
    currentUserStock = []
    arr.forEach((_item) => {
      if (_item.name == item.name) {
        currentUserStock.push(item)
      }
    })
    //console.log(currentUserStock)
    return currentUserStock.length
  }

  return new Promise(async (resolve, reject) => {
    try {
      let currentUser = await UserModel.findOne({ _id: user._id })
      let whiteShirts = await ShirtModel.find({ name: item.name })
      let length = getStock(currentUser.cart)
      validate(whiteShirts.length, length)
      checkDuplicate(currentUser.cart, whiteShirts)
      let doc = await currentUser.save()
      resolve(doc.cart)
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}

Shirt.subtractShirt = function ({ user, item }) {
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

Shirt.getQuantity = function (category, id) {
  return new Promise(async (resolve, reject) => {
    let user = await UserModel.findOne({ _id: id })
    let arr = user.cart.filter((item) => {
      return item.category
    })
  })
}

Shirt.delete = function (idArray) {
  return new Promise(async (resolve, reject) => {
    let shirts = await ShirtModel.find()
    idArray.forEach((id) => {
      let num = shirts.findIndex((item, index) => {
        if (item._id.toString() === id) {
          return true
        }
      })
      shirts.splice(num, 1)
    })
    await ShirtModel.deleteMany()
    console.log(shirts)
    let _shirts = await ShirtModel.insertMany(shirts)
    resolve(_shirts)
  })
}

// NOTE: Fix "addShirt" method to not add a random item but instead pick an item that hasn't been added yet

module.exports = Shirt
