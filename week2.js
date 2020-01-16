var dataservice = require("./data-service.js");
var path = require("path");
var express = require("express");
var app = express();
const multer = require("multer");
const fs = require('fs');
var bodyParser = require('body-parser')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.get("/viewData", function(req,res){

    var someData = {
        name: "John",
        age: 23,
        occupation: "developer",
        company: "Scotiabank"
    };

    res.render('viewData', {
        data: someData,
        layout: false // do not use the default Layout (main.hbs)
    });

});

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
  //res.sendFile(path.join(__dirname,"/views/home.html"));
  res.render("home");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
  });



 app.get('/employees/:employeeNum', (req, res) => {
  dataservice.getEmployeeByNum(req.params.employeeNum)
  .then((data) =>  
    res.json(data))
 });
// setup another route to listen on /employees
app.get('/employees', (req, res) => {
  if(req.query.status) {
      dataservice.getEmployeesByStatus(req.query.status)
          .then((data) => 
            res.json(data))
          .catch((err) => 
            res.json({"message": err}))
  } else if(req.query.department){
      dataservice.getEmployeesByDepartment(req.query.department)
          .then((data) =>  
            res.json(data))
          .catch((err) => 
            res.json({"message": err}))
   } else if(req.query.manager){
      dataservice.getEmployeesByManager(req.query.manager)
          .then((data) =>  
            res.json(data))
          .catch((err) => 
            res.json({"message": err}))
  }else{
      dataservice.getAllEmployees()
          .then((data) => 
            res.json(data))
          .catch((err) => 
            res.json({"message": err}))
  }
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
  //console.log(req.body);
  dataservice.addEmployee(req.body)
  .then(function (data) {
    res.redirect("/employees");
})
.catch(function (rejectMsg) {
  console.log("Unable to display the departments list.");
})
});


app.get("/images/add", (req,res)=>{
  res.sendFile(path.join(__dirname,"/views/addImages.html"));
});


app.post("/images/add", upload.single(("imageFile")), (req, res) => {
  res.redirect("/images");
});

app.get("/images", (req,res) =>{
  fs.readdir("./public/images/uploaded", function(err, data) {
      res.status(200);
      res.json(data);
  });
});

/*

app.get("/employees?department=value", function(req,res){
  dataservice.getEmployeesByDepartment(department)
    .then(function (data) {
      //res.json(data);
  })
  .catch(function (rejectMsg) {
    console.log("Unable to display the managers list.");
  })
});


app.get("/employees?manager=value", function(req,res){
  dataservice.getEmployeesByManager(manager)
    .then(function (data) {
      //res.json(data);
  })
  .catch(function (rejectMsg) {
    console.log("Unable to display the managers list.");
  })
});

app.get("/employee/value", function(req,res){
  dataservice.getEmployeeByNum(num)
    .then(function (data) {
      //res.json(data);
  })
  .catch(function (rejectMsg) {
    console.log("Unable to display the managers list.");
  })
});
*/

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

