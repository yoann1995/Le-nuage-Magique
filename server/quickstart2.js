var fs = require('fs');
var express = require('express');
var GoogleDriveConnector = require("./googleDriveConnector");
var rand = require("generate-key");
var session = require('client-sessions');
var https = require('https');

var app = express();

GDC = new GoogleDriveConnector();

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

function msgJSON(key, msg) {
  let o = {}
  o[key] = msg;
  return o;
}

app.get('/authGoogleDrive', function(req, res) {
  GDC.getToken(req.query.code);
});

app.get('/listFiles', function(req, res) {
  GDC.files(res);
});

app.get('/connect', function(req, res) {
  res.end('<a href="'+GoogleDriveConnector.getConnexionURL()+'">Link</a>')
});


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});