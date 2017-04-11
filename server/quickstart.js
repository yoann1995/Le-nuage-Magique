var fs = require('fs');
var express = require('express');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var Cookies = require( "cookies" );
var rand = require("generate-key");
var app = express();

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
var TOKEN_DIR = '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

var GoogleDriveAuth = [];


function GoogleDriveConnection(res, callback){
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Drive API.
    authorize(JSON.parse(content), res, callback);
  });
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, res, callback) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.javascript_origins[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, res);
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
function getNewToken(oauth2Client, res) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  let key = rand.generateKey(12);
  GoogleDriveAuth[key] = oauth2Client;
  res.cookie('GoogleDriveAuth', key, { maxAge: 900000, httpOnly: true });
  res.redirect(authUrl);
}

function userCredentials(oauth2Client, code){
  oauth2Client.getToken(code, function(err, token) {
    if (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
    oauth2Client.credentials = token;
    storeToken(token);
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
function listFiles(auth, res) {
  var service = google.drive('v3');
  service.files.list({
    auth: auth,
    //pageSize: 10,
    fields: "nextPageToken, files(id, name, mimeType,parents)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var files = response.files;
    res.send(JSON.stringify(msgJSON('files', files)));
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

function msgJSON(key,msg){
  let o = {}
  o[key] = msg;
  return o;
}

app.get('/authGoogleDrive', function(req, res){
  cookies = new Cookies( req, res);
  key = cookies.get('GoogleDriveAuth');
  userCredentials(GoogleDriveAuth[key],req.query.code);
});

app.get('/listFiles', function(req, res){
  GoogleDriveConnection(res, listFiles);
});


app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});