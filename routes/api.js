var express = require("express")
var router = express.Router()
const BingeController = require("../controllers/BingeController")

//  TRENDING ALL/TV/MOVIE DAY
router.post("/trending", BingeController.trendingList)

router.post("/search", BingeController.searchList)

router.post("/filter", BingeController.filterList)

router.post("/getDetails", BingeController.getDetails)

module.exports = router
