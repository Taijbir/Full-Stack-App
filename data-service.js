const fs = require('fs');
var employees = [];
var departments = [];


module.exports.initialize = function() {
    return new Promise (function(resolve, reject) {
    fs.readFile('data/departments.json', 'utf8', (err, data) => {
        if (err) throw err;
        departments = JSON.parse(data);
    });
   
    fs.readFile('data/employees.json', 'utf8', (err, data) => {
        if (err) {
            throw err;
        }
        employees = JSON.parse(data);
    });

        resolve('Data parsed successfully.');
        reject('Unable to read file.');
    });
};


module.exports.getAllEmployees = function() {
    return new Promise (function(resolve, reject) {
        resolve(employees);
        if (employees.length == 0) 
            reject("error in get employees"); 
    });
};


module.exports.getDepartments = function() {
    return new Promise (function(resolve, reject) {
        resolve(departments);
        if (departments.length == 0) 
            reject("error in get departments"); 
    });
};

module.exports.getManagers = function(){
    return new Promise((resolve, reject) => {
        const managers = employees.filter(employees => employees.isManager == true);
        //var managers = [];
        resolve(managers);
        if(managers.length == 0)
            reject("error in get managers"); 
        
    });
};




