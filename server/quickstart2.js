var fs = require('fs');
var express = require('express');
var rand = require("generate-key");
var session = require('client-sessions');
var https = require('https');

/**** CONNECTOR ****/
var GoogleDriveConnector = require("./googleDriveConnector");
var DropboxConnector = require("./dropboxConnector");

var app = express();

GDC = new GoogleDriveConnector();
DC = new DropboxConnector();

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

app.get('/', function(req, res){
  fs.readFile('wiki.html', function(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    res.end(content);
  });
});

app.get('/authGoogleDrive', function(req, res) {
  GDC.getToken(req.query.code, res);
});

app.get('/authDropbox', function(req, res) {
  DC.getToken(req.query.code, res);
});

app.get('/listFiles/GoogleDrive', function(req, res) {
  GDC.files(res);
});

app.get('/listFiles/Dropbox', function(req, res) {
  DC.files(res);
});

app.get('/about', function(req, res) {
  GDC.about(res);
});

app.get('/connect/GoogleDrive', function(req, res) {
  res.end('<a href="'+GoogleDriveConnector.getConnexionURL()+'">Link</a>')
});

app.get('/connect/Dropbox', function(req, res) {
  res.end('<a href="'+DropboxConnector.getConnexionURL()+'">Link</a>')
});


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});