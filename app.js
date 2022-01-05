const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const router = require("../API/router")
const dotenv = require("dotenv")
const cors = require("cors")
const app = express()

dotenv.config()

app.use(cookieParser())
app.use(express.json())
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

app.get("/", (req, res) => {
  res.send("Welcome to the API")
})

app.use("/api", router)

mongoose.connect(process.env.CONNECT, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) {
    console.log(err)
  } else {
    app.listen(process.env.PORT, () => {
      console.log("Connected")
      console.log("Server running")
    })
  }
})
