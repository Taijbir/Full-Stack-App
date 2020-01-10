var dataservice = require("./data-service.js");
var path = require("path");
var express = require("express");
var app = express();
const multer = require("multer");
const fs = require('fs');
var bodyParser = require('body-parser')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

var HTTP_PORT = process.env.PORT || 8080;

//app.set('view engine', 'html');

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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

// setup another route to listen on /managers 
app.get("/managers", function(req,res){
  dataservice.getManagers()
    .then(function (data) {
      res.json(data);
  })
  .catch(function (rejectMsg) {
    console.log("Unable to display the managers list.");
  })
});
// setup another route to listen on /departments
app.get("/departments", function(req,res) {
  dataservice.getDepartments()
    .then(function (data) {
      res.json(data);
  })
  .catch(function (rejectMsg) {
    console.log("Unable to display the departments list.");
  })
});



app.get("/employees/add", function(req,res){
  res.sendFile(path.join(__dirname,"/views/addEmployee.html"));
});

app.post("/employees/add", (req, res) => {
  //res.redirect("/employees");

  //const formData = req.body;
  res.json({requestBody: req.body});
  console.log(req.body);
  
});

app.get("/images/add", (req,res)=>{
  res.sendFile(path.join(__dirname,"/views/addImages.html"));
});


app.post("/images/add", upload.single(("imageFile")), (req, res) => {
  res.redirect("/images");
});

app.get("/images", (req,res) =>{
  fs.readdir("./public/images/uploaded", function(err, data) {
      //res.status(200).send('images', {
      //  images : data,
      //  title: "Images"
      //});
      
      res.status(200);
      res.json(data);
  });
});


app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// setup http server to listen on HTTP_PORT
dataservice.initialize()
.then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
.catch(()=> {
  console.log("Could not initialize the json array");
})

