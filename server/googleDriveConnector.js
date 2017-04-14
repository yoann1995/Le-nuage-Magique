var https = require('https');
var querystring = require('querystring');

var client_id = '739612828231-qu956bv1d3f2i17d4rnmsgf002cqc7e7.apps.googleusercontent.com';
var scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly';
var redirect_uri = 'http://localhost:8080/authGoogleDrive';
var client_secret = 'rdlvoJUZMBBj3RuI_Wyb-39a';

var rest_api_url = 'https://www.googleapis.com/drive/v3';

class GoogleDriveConnector {
  constructor() {
    this.bearer = ''; 
  }

  static getConnexionURL(){
  return 'https://accounts.google.com/o/oauth2/v2/auth?scope=' + scope + '&state=state_parameter_passthrough_value&redirect_uri=' + redirect_uri + '&access_type=online&response_type=code&client_id=' + client_id;
 }

 getToken(code) {
  var data = querystring.stringify({
    client_secret: client_secret,
    grant_type: 'authorization_code',
    client_id: client_id,
    code: code,
    redirect_uri: redirect_uri
  });
  var options = {
    host: 'www.googleapis.com',
    path: '/oauth2/v4/token?code=' + code + '&client_id=' + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirect_uri + '&grant_type=authorization_code',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data)
    },
    method: 'POST',
    port: 443
  };
  this.httpRequest(data, options, this.setBearer);
 }

 setBearer(b){
  let json = JSON.parse(b);
  this.bearer = json.access_token;
 }

/*** FUN LIST ***/

about(){
  rest_api('GET', 'about', writeJSON);
}

files(){
  rest_api('GET', 'files', writeJSON);
}

writeJSON(){

}

rest_api(method, f, data, callback){
  var options = {
    host: 'www.googleapis.com',
    path: '/drive/v3/'+f+'?access_token=' + bearer,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data)
    },
    method: method,
    port: 443
  };
  this.httpRequest(data, options, callback);
}

/****** UTIL ******/

httpRequest(data, options, callback) {
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var content = '';
    res.on('data', function(chunk) {
      content += chunk;
    });
    res.on('end', function() {
      if (res.statusCode === 200) {
        if (typeof callback === 'undefined')
          console.log(content);
        else
          callback(content);
      } else {
        console.log('Status:', res.statusCode);
      }
    });
  }).on('error', function(err) {
    console.log('Error:', err);
  });;

  req.write(data);
  req.end()
 }
}

module.exports = GoogleDriveConnector;