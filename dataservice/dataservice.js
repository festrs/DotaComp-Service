var mongoose = require("mongoose");
var async   = require("async");
var q = require("q");
// Models
var LiveGamesModel = mongoose.model("LiveGames");
var UpComingGamesModel = mongoose.model("UpComingGames");
var EndedGamesModel = mongoose.model("EndedGames");
var TournamentsModel = mongoose.model("Tournaments");
var Teams = mongoose.model("Teams");

module.exports.getLiveGames = function(req, res) { 

  console.log();

  LiveGamesModel
  .find()
  .exec(function(err, liveGames) {
    res.header("Cache-Control", "public, max-age=30");
    var result = [];

    async.each(liveGames, function (game, callback) {
      
      var gameString = JSON.stringify(game);
      var gameObject = JSON.parse(gameString);

      async.parallel([
          function(callback2) {
            if(gameObject.radiant_team){
              findTeamByID(gameObject.radiant_team.team_id).then(function(team){
                if(team){
                  gameObject.radiant_team.logo_url = team.logoUrl;
                  gameObject.radiant_team.tag = team.tag;
                  gameObject.radiant_team.logo_sponsor_url = team.logoSponsorUrl;
                  gameObject.radiant_team.country_code = team.countryCode;
                }
                callback2(null,team);  
              }); 
            }else{
              callback2(null,null);
            }
          },
          function(callback2) {
            if(gameObject.dire_team){ 
              findTeamByID(gameObject.dire_team.team_id).then(function(team){
                if(team){
                  gameObject.dire_team.logo_url = team.logoUrl;
                  gameObject.dire_team.tag = team.tag;
                  gameObject.dire_team.logo_sponsor_url = team.logoSponsorUrl;
                  gameObject.dire_team.country_code = team.countryCode;
                }
                callback2(null,team);
              });
            }else{
              callback2(null,null)
            }
          }
      ],
      function(err, results) {
        if (err){
          console.log(err);
        } 
        TournamentsModel.findOne({"leagueid" : gameObject.league_id}).exec(function(err, tournament){
          if (err){
            console.log(err);
          } 
          if(tournament){
            var tournamentString = JSON.stringify(tournament);
            var tournamentObject = JSON.parse(tournamentString);
            gameObject.tournament_name = tournamentObject.name.replace("#DOTA_Item_","");
          }
          
          if(req.params.complete === "true"){
              if(!(results[0] === null || results[1] === null)){
                result.push(gameObject);
              }
          }else{
            result.push(gameObject);
          }
          callback();
        });
      });
    }, function (err) {
      if (err){
        console.error(err.message);
      } 
      res.status(200).json(result);
    });
  });
};

module.exports.getTournaments = function(req, res) { 
  TournamentsModel
  .find()
  .exec(function(err, tournaments) {
    res.header("Cache-Control", "public, max-age=86400");
    res.status(200).json(tournaments);
  });
};

module.exports.getUpComingGames = function(req, res) { 
  UpComingGamesModel
  .find()
  .exec(function(err, upComingGames) {
    res.header("Cache-Control", "public, max-age=300");
    res.status(200).json(upComingGames);
  });
};

module.exports.getEndedGames = function(req, res) { 
  EndedGamesModel
  .find()
  .exec(function(err, endedGames) {
    res.header("Cache-Control", "public, max-age=300");
    res.status(200).json(endedGames);
  });
};

function findTeamByID(teamID){
  return Teams.findById(teamID, function (err, team) {  
      if (err) {
        console.log(err);
      }
    });
}