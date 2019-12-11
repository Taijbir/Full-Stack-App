var dataservice = require("./data-service.js");
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
app.get("/employees", function(req,res) {
  dataservice.getAllEmployees()
.then(function (data) {
res.json(data);
})
    .catch(function (rejectMsg) {
console.log("Unable to display the employees list.");
})
});
/*
// setup another route to listen on /managers 
app.get("/managers", function(req,res){
  //res.sendFile(path.join(__dirname,"/data/employees.json"));
});
*/
// setup another route to listen on /departments
app.get("/departments", function(req,res) {
  dataservice.getdepartments()
.then(function (data) {
res.json(data);
})
    .catch(function (rejectMsg) {
console.log("Unable to display the departments list.");
})
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
