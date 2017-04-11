var express = require('express');
var app = express();
var fs = require("fs");

app.get('/listFiles', function (req, res) {
    fs.readFile( __dirname + "/" + "debug/exempleFilesList.json", 'utf8', function (err, data) {
       console.log( 'exempleFilesList.json' );
       res.end( data );
   });
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});