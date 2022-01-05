const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Field cannot be left blank"],
    unique: [true, "That username is already taken"],
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [15, "Username cannot exceed 15 characters"],
  },
  email: {
    type: String,
    required: [true, "Field cannot be left blank"],
    unique: [true, "That email is already in use"],
    validate: [
      (value) => {
        return validator.isEmail(value) //function can be passed in as first argument
      },
      "You must enter a valid email", //second argument will be error msg
    ],
  },
  password: {
    type: String,
    required: [true, "Field cannot be left blank"],
  },
  cart: Array,
  isAdmin: Boolean,
})

const UserModel = mongoose.model("user", userSchema)

let User = function (data) {
  this.data = data
}

User.prototype.hashPassword = function () {
  return new Promise((resolve, reject) => {
    if (this.data.password.length < 8) {
      reject("Password must be at least 8 characters")
    } else {
      console.log("Test")
      bcrypt.hash(this.data.password, 10, (err, hash) => {
        if (!err) {
          this.data.password = hash
          resolve(this.data.password)
        } else {
          reject(err)
        }
      })
    }
  })
}

User.prototype.createUser = function () {
  return new Promise(async (resolve, reject) => {
    try {
      await this.hashPassword() //bcrypt.hash() is asynchronous
      let user = new UserModel({
        username: this.data.username,
        email: this.data.email,
        password: this.data.password,
        cart: [],
        isAdmin: false,
      })
      user
        .save() //returns promise
        .then((item) => {
          console.log(item)
          resolve(item)
        })
        .catch((err) => {
          reject(err)
        })
    } catch (err) {
      reject({ error: err, code: 3 }) // error code 3 means that password is too short
    }
  })
}

User.prototype.login = function () {
  return new Promise(async (resolve, reject) => {
    let user = await UserModel.findOne({ username: this.data.username })
    if (user && bcrypt.compareSync(this.data.password, user.password)) {
      resolve(user)
    } else {
      reject("Invalid username/password")
    }
  })
}

User.getCartItems = function (_id) {
  return new Promise(async (resolve, reject) => {
    let user = await UserModel.findOne({ _id })
    if (user) {
      resolve(user.cart)
    } else {
      reject("404")
    }
  })
}

module.exports = { User, UserModel }
