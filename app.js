/**
 * Module dependencies.
 */

var express = require("express");
var http = require("http");
var logger = require("morgan");
var bodyParser = require("body-parser");
var path = require("path");
var methodOverride = require("method-override");
var multer = require("multer");
var errorHandler = require("errorhandler");
// [SH] Bring in the data model
require("./db");

// [SH] Bring in the routes for the API (delete the default routes)
var routesApi = require("./router/index");

var app = express();

app.set("port", process.env.PORT || 3000);
app.use(logger("dev"));
app.use(methodOverride());

// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse multipart/form-data
app.use(multer());

// [SH] Use the API routes when path starts with /api
app.use("/api", routesApi);


// catch 404 and forward to error handler
app.get("*", function(req, res){
  var err = new Error("Not Found");
  err.status = 404;
  res.status(404).send(err);
});

// error handlers

// [SH] Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {}
    });
});


http.createServer(app).listen(app.get("port"), function(){
  console.log("Express server listening on port " + app.get("port"));
});