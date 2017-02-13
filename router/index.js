var express = require("express");
var router = express.Router();

// var jwt = require("express-jwt");
// var secret = "MY_SECRET";
// if (process.env.SECRECT) {
// 	secret = process.env.SECRECT;
// }
// var auth = jwt({
//   secret: secret,
//   userProperty: "payload"
// });

var ctrlDataService = require("../dataservice/dataservice");

// Data Service
router.get("/livegames/:complete", ctrlDataService.getLiveGames);
router.get("/tournaments", ctrlDataService.getTournaments);
router.get("/upcominggames", ctrlDataService.getUpComingGames);
router.get("/endedgames", ctrlDataService.getEndedGames);


// authentication
// router.post("/register", ctrlAuth.register);
// router.post("/login", ctrlAuth.login);

module.exports = router;
