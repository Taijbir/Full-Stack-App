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
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.hbs',exphbs({
    extname:'.hbs', 
    defaultLayout:'main',
    helpers:{
        navLink:function(url, options){
            return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
                +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
        },
        equal:function(lvalue, rvalue, options){
            if(arguments.length<3)
                throw new Error("Handlerbars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
}));
app.use(function(req,res,next){
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
 });
 


app.get("/", function(req,res){
  //res.sendFile(path.join(__dirname,"/views/home.html"));
  res.render("home");
});


app.get("/about", function(req,res){
    //res.sendFile(path.join(__dirname,"/views/about.html"));
    res.render("about");
});



// app.get('/employee/:employeeNum', (req, res) => {
// 	console.log(req.params.employeeNum);
//   dataservice.getEmployeeByNum(req.params.employeeNum)
//   .then((data) =>  res.render("employee",{employee:data}))
//   .catch(() => res.render("employee",{message: "no results"})) 
// });

app.get("/employee/:employeeNum", (req, res) => {
    let viewData = {};
    dataservice.getEmployeeByNum(req.params.employeeNum).then((data) => {     
      console.log(data);
      if (data) {
        viewData.employee = data[0]; 
        //console.log(viewData.employee);
        //console.log(viewData.employee.firstName)
      } else {
        viewData.employee = null; 
      }
    }).catch(() => {
      viewData.employee = null; 
    }).then(dataservice.getDepartments)
      .then((data) => {
        viewData.departments = data; 
        for (let i = 0; i < viewData.departments.length; i++) {
          if (viewData.departments[i].departmentId == viewData.employee.department) {
            viewData.departments[i].selected = true;
          }
        }
    }).catch(() => {
      viewData.departments = []; 
    }).then(() => {
      if (viewData.employee == null) { 
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData }); 
      }
    });
 });

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
      .then((data) => res.render("employees",{employees:data}))
      .catch(() => res.render("employees",{message: "no results"}))
  }
});


// // setup another route to listen on /managers 
// app.get("/managers", function(req,res){
//   dataservice.getManagers()
//     .then(function (data) {
//       res.json(data);
//   })
//   .catch(function (rejectMsg) {
//     console.log("Unable to display the managers list.");
//   })
// });


app.get("/departments", function(req,res) {
  dataservice.getDepartments()
  .then((data) => res.render("departments",{departments:data}))
  .catch(() => res.render("departments",{"message": "no results"}))
});



app.get("/employees/add", (req,res)=>{
  //res.sendFile(path.join(__dirname+"/views/addEmployee.html"));
  res.render("addEmployee");
});


app.post("/employees/add", (req, res) => {
  //console.log(req.body);
  dataservice.addEmployee(req.body)
  .then(res.redirect('/employees'))
  .catch((err) => res.json({"message": err})) 
});

app.get("/images", (req, res) => {
  fs.readdir("./public/images/uploaded", function(err, imageFile){
      //res.json(imageFile);
      res.render("images",  { data: imageFile, title: "Images" });
  })

})


app.get("/images/add", (req,res)=>{
  //res.sendFile(path.join(__dirname,"/views/addImages.html"));
  res.render("addImages");
});


app.post("/images/add", upload.single(("imageFile")), (req, res) => {
  res.redirect("/images");
});

// app.post("/employee/update", function(req, res){
//    dataservice.updateEmployee(req.body)
//    .then(res.redirect('/employees'))
//  });

app.get("/images", (req,res) =>{
  fs.readdir("./public/images/uploaded", function(err, data) {
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
