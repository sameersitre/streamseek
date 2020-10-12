var express = require("express")
var router = express.Router()
const BingeController = require("../controllers/BingeController")

router.post("/getDetails", BingeController.getDetails)

module.exports = router
