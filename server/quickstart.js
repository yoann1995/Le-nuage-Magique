var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var express = require('express');
var Cookies = require( "cookies" );
var rand = require("generate-key");
var app = express();

var GoogleDriveAuth = [];

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
var TOKEN_DIR = './.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

function GoogleDriveConnection(res){
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      errJSON('Error loading client secret file: ' + err);
    }
    // Authorize a client with the loaded credentials, then call the
    // Drive API.
    authorize(JSON.parse(content), sendJSON, res);
  });
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, res) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.javascript_origins[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      callback(getNewToken(oauth2Client, callback), res, oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, res);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  return JSON.stringify(msgJSON('URL',authUrl));
/*
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });*/
}

function errJSON(msg){
  return JSON.stringify(msgJSON('Error',msg));
}

function msgJSON(key,msg){
  let o = {}
  o[key] = msg;
  return o;
}

function newToken(oauth2Client, code, res){
  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    oauth2Client.credentials = token;
    storeToken(token);
    sendJSON2('Ok',res);
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  var service = google.drive('v3');
  service.files.list({
    auth: auth,
    pageSize: 10,
    fields: "nextPageToken, files(id, name)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var files = response.files;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      console.log('Files:');
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log('%s (%s)', file.name, file.id);
      }
    }
  });
}

function sendJSON(msg,res, oauth2Client){
  let key = rand.generateKey(12);
  GoogleDriveAuth[key] = oauth2Client;
  res.cookie('GoogleDriveAuth', key, { maxAge: 900000, httpOnly: true });
  console.log(GoogleDriveAuth);
  res.send(msg);
}

function sendJSON2(msg,res){
  res.send(msg);
}

app.get('/authGoogleDrive', function(req, res){
  cookies = new Cookies( req, res);
  key = cookies.get('GoogleDriveAuth');
  newToken(GoogleDriveAuth[key],req.query.code);
});

app.get('/addGoogleDriveConnection', function(req, res){
  console.log(GoogleDriveConnection(res));
});

app.get('/listFiles', function(req, res){
  cookies = new Cookies( req, res);
  key = cookies.get('GoogleDriveAuth');
  listFiles(GoogleDriveAuth[key]);
});


app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});