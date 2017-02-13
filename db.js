var mongoose = require("mongoose");
var generator = require("mongoose-gen");
var fs = require("fs");
var gracefulShutdown;
var dbURI = "mongodb://localhost/dotacomp";

if (process.env.MONGODB_URI != null) {
  dbURI = process.env.MONGODB_URI;
}

mongoose.Promise = require("q").Promise;

var connection = mongoose.connect(dbURI);
// CONNECTION EVENTS
mongoose.connection.on("connected", function() {
  console.log("Mongoose connected to " + dbURI);
});
mongoose.connection.on("error", function(err) {
  console.log("Mongoose connection error: " + err);
});
mongoose.connection.on("disconnected", function() {
  console.log("Mongoose disconnected");
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log("Mongoose disconnected through " + msg);
    callback();
  });
};
// For nodemon restarts
process.once("SIGUSR2", function() {
  gracefulShutdown("nodemon restart", function() {
    process.kill(process.pid, "SIGUSR2");
  });
});
// For app termination
process.on("SIGINT", function() {
  gracefulShutdown("app termination", function() {
    process.exit(0);
  });
});
// For Heroku app termination
process.on("SIGTERM", function() {
  gracefulShutdown("Heroku app termination", function() {
    process.exit(0);
  });
});

// BRING IN YOUR SCHEMAS & MODELS
// load json
var liveGamesData = fs.readFileSync("./downloads/livegames_jsonschema.json", {encoding: "utf8"});
var upComingGamesData = fs.readFileSync("./downloads/upcoming_jsonschema.json", {encoding: "utf8"});
var endedGamesData = fs.readFileSync("./downloads/endedgames_jsonschema.json", {encoding: "utf8"});
var tournamentsData = fs.readFileSync("./downloads/tournament_jsonschema.json", {encoding: "utf8"});

var liveGameJson = JSON.parse(liveGamesData);
var upComingGamesJson = JSON.parse(upComingGamesData);
var endedGamesJson = JSON.parse(endedGamesData);
var tournamentsJson = JSON.parse(tournamentsData);

// Generate the Schema object.
var LiveGamesSchema = new mongoose.Schema(generator.convert(liveGameJson));
var UpComingGamesSchema = new mongoose.Schema(generator.convert(upComingGamesJson));
var EndedGamesSchema = new mongoose.Schema(generator.convert(endedGamesJson));
var TournamentsSchema = new mongoose.Schema(generator.convert(tournamentsJson));

var TeamSchema = new mongoose.Schema({
    _id:             { type: Number, required: true},
    name:            { type: String, required: false},
    tag:             { type: String, required: false},
    timeCreated:     { type: Number, required: false},
    rating:          { type: String, required: false},
    logo:            { type: Number, required: false},
    logoSponsor:     { type: Number, required: false},
    countryCode:     { type: String, required: false},
    logoUrl:         { type: String, required: false},
    logoSponsorUrl:  { type: String, required: false}
});

// Connect to mongodb and bind the models.
mongoose.model("LiveGames", LiveGamesSchema);
mongoose.model("UpComingGames", UpComingGamesSchema);
mongoose.model("EndedGames", EndedGamesSchema);
mongoose.model("Tournaments", TournamentsSchema);
mongoose.model("Teams", TeamSchema);