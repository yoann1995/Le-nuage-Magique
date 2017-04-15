var fs = require('fs');
var express = require('express');
var rand = require("generate-key");
var session = require('client-sessions');
var https = require('https');
var simpleBarrier = require('simple-barrier');


/**** CONNECTOR ****/
var GoogleDriveConnector = require("./googleDriveConnector");
var DropboxConnector = require("./dropboxConnector");

var app = express();
var barrier = simpleBarrier();
var barrier2 = simpleBarrier();

GDC = new GoogleDriveConnector();
DC = new DropboxConnector();

connectorList = [];

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

/****** AUTH *******/

app.get('/authGoogleDrive', function(req, res) {
  GDC.getToken(req.query.code, res);
  connectorList.push(GDC);
});

app.get('/authDropbox', function(req, res) {
  DC.getToken(req.query.code, res);
  connectorList.push(DC);
});


/***** LIST FILES ******/

app.get('/listFiles', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  for(var i = 0; i < connectorList.length; i++){
    connectorList[i].files(res, barrier.waitOn(mergelistFiles));
  }
  let merged_json = [];
  barrier.endWith(function( json ){
    merged_json.push(json);
    console.log(json);
    res.end(JSON.stringify(json));
  });
});

app.get('/listFiles/GoogleDrive', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  GDC.files(res);
});

app.get('/listFiles/Dropbox', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  DC.files(res);
});

function mergelistFiles(res, data){
  return data;
}

/****** SPACE USAGE ******/

app.get('/spaceUsage', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  for(var i = 0; i < connectorList.length; i++){
    connectorList[i].space_usage(res, barrier2.waitOn(mergeSpaceUsage));
  }
  let merged_json = [];
  barrier2.endWith(function( json ){
    merged_json.push(json);
    console.log(json);
    res.end(JSON.stringify(json));
  });
});

app.get('/spaceUsage/Dropbox', function(req, res) {
  DC.space_usage(res);
});

app.get('/spaceUsage/GoogleDrive', function(req, res) {
  GDC.space_usage(res);
});

function mergeSpaceUsage(res, data){
  console.log(data);
  return data;
}

/****** CONNECT *******/

app.get('/connect/GoogleDrive', function(req, res) {
  res.end('<a href="'+GoogleDriveConnector.getConnexionURL()+'">Link</a>')
});

app.get('/connect/Dropbox', function(req, res) {
  res.end('<a href="'+DropboxConnector.getConnexionURL()+'">Link</a>')
});


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
