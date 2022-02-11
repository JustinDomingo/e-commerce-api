let { User } = require("../models/User")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")

dotenv.config()

const createToken = (data) => {
  return jwt.sign({ item: data }, process.env.SECRET, { expiresIn: "1d" }) // payload must be an object
}

exports.register = async (req, res) => {
  let user = new User(req.body)
  try {
    let validUser = await user.createUser() //be sure to include "await" otherwise promise is pending
    let token = createToken(validUser)
    res.cookie("jwt", token, { httpOnly: true, maxAge: 1000 * 60 * 24 })
    res.status(201).send({
      username: validUser.username,
      email: validUser.email,
      _id: validUser._id,
    })
  } catch (err) {
    //"err" will be mongoose validation error
    let oldErrors = err.errors
    let errors = {}
    if (err.code == 3) {
      errors.passwordErrors = err.error
    }
    if (oldErrors && oldErrors.username) {
      errors.usernameErrors = oldErrors.username.properties.message
    }
    if (oldErrors && oldErrors.email) {
      errors.emailErrors = oldErrors.email.properties.message
    }
    res.status(400).json(errors)
  }
}

exports.login = async (req, res) => {
  let user = new User(req.body) //creating a new attempted user
  user
    .login() //validates if attempted user is valid
    .then((item) => {
      let token = createToken(item)
      res.cookie("jwt", token, { httpOnly: true, maxAge: 1000 * 60 * 24 })
      res.status(201).send({
        username: item.username,
        email: item.email,
        _id: item._id,
      })
    })
    .catch((err) => {
      res.status(500).json(err)
    })
}

exports.logout = (req, res) => {
  res.clearCookie("jwt")
  res.send("Cookie cleared")
}

exports.getCartItems = async (req, res) => {
  try {
    let cart = await User.getCartItems(req.params.id)
    res.status(201).json(cart)
    console.log(cart)
  } catch {
    res.status(500).json("Error")
  }
}

exports.jwtValidate = (req, res, next) => {
  let token = req.cookies.jwt
  jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
    if (!err) {
      req.validUser = decodedToken
      next()
    } else {
      console.log("Failed")
      res.status(500).send("Invalid token")
    }
  })
}

exports.clearCartItems = (req, res) => {
  User.clearCart(req.params.id)
    .then((user) => {
      res.status(201).json(user)
    })
    .catch((err) => {
      res.status(500).json(err)
    })
}

exports.updateAddress = (req, res) => {
  User.setAddress(req.body, req.params.userid)
    .then((user) => {
      res.status(201).json(user)
    })
    .catch((err) => {
      res.status(500).json(err)
    })
}

exports.deleteAddress = (req, res) => {
  User.deleteAddress(req.params.userid)
    .then((user) => {
      res.status(201).json(user)
    })
    .catch((err) => {
      res.status(500).json(err)
    })
}

exports.getUser = (req, res) => {
  User.getUser(req.params.id)
    .then((user) => {
      res.status(201).json(user)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json(err)
    })
}
