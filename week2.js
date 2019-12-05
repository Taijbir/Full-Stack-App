var dataService = require("./data-service.js");
var path = require("path");
var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
  res.sendFile(path.join(__dirname,"/views/home.html"));
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
  });

  // setup another route to listen on /employees
app.get("/employees", function(req,res){
  res.sendFile(path.join(__dirname,"/data/employees.json"));
});
app.get("/managers", function(req,res){
  res.json({ isManager :"true"});
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
