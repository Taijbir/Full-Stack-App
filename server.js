var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

// setup a 'route' to listen on the default url path
app.get('/', function (req, res) {
    res.send('Hello World');
  });
  
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, function () {
});