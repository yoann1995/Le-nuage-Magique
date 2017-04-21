var https = require('https');
var querystring = require('querystring');

var NuageConst = require("./nuageConst");
var NuageFile = require("./nuageFile");
var NuageUsage = require("./nuageUsage");
var NuageAccount = require("./nuageAccount");

var client_id = '3utkchwe9s4upxs';
var redirect_uri = 'http://localhost:8080/authDropbox';
var client_secret = '9pdyuatgrykfflb';

var rest_api_url = 'https://content.dropboxapi.com/1';

class DropboxConnector {
  constructor() {
    this.bearer = '';
  }

  static getConnexionURL() {
    return 'https://www.dropbox.com/1/oauth2/authorize?response_type=code&redirect_uri=' + redirect_uri + '&client_id=' + client_id;
  }

  getToken(code, res) {
    var data = querystring.stringify({
      client_secret: client_secret,
      grant_type: 'authorization_code',
      client_id: client_id,
      code: code,
      redirect_uri: redirect_uri
    });
    var options = {
      host: 'api.dropboxapi.com',
      path: '/1/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      },
      method: 'POST',
      port: 443
    };
    this.httpRequest(data, options, this.setBearer.bind(this), res);
  }

  setBearer(b, res) {
    let json = JSON.parse(b);
    this.bearer = json.access_token;
    console.log('Dropbox : OK\nbearer:', this.bearer);
    res.redirect(NuageConst.URL_AFTER_CONNECT);
    //res.end('Bearer OK')
  }

  /*** FUN LIST ***/

  space_usage(res, mainCallback) {
    var data = 'null';
    this.rest_api('POST', 'users/get_space_usage', this.extractSpaceUsage, res, data, mainCallback);
  }

  extractSpaceUsage(data, res, mainCallback) {
    var json = JSON.parse(data);
    let o = {}
    console.log(json);
    let u = new NuageUsage(json.used, json.allocation.allocated);
    o['Dropbox'] = u;
    mainCallback(res, o);
    //res.end(JSON.stringify(o));
  }

  files(res, mainCallback) {
    var data = {
      path: '',
      recursive: true
    }
    this.rest_api('POST', 'files/list_folder', this.extractFiles, res, JSON.stringify(data), mainCallback);
  }

  extractFiles(data, res, mainCallback) {
    var json = JSON.parse(data);
    var fileList = [];
    for (var i = 0; i < json.entries.length; i++) {
      var obj = json.entries[i];
      var n = new NuageFile(obj.id, obj.name, json.entries[i]['.tag']);
      n.sources.push('Dropbox');
      let parent = fileList;
      let path_display = obj.path_display;
      while (path_display != ('/' + obj.name)) {
        let p = path_display.substring(1, path_display.indexOf("/", 1));
        for (var i = 0; i < parent.length; i++) {
          if (parent[i].name == p) {
            parent = parent[i].children;
          }
        }
        path_display = path_display.substring(path_display.indexOf("/", 1), path_display.length);
        break;
      }
      parent.push(n);
    }
    mainCallback(res, fileList);
  }

  account_infos(res, mainCallback) {
    var data = 'null';
    this.rest_api('POST', 'users/get_current_account', this.extractAccountInfos, res, data, mainCallback);
  }

  extractAccountInfos(data, res, mainCallback) {
    var json = JSON.parse(data);
    console.log(json);
    let accountJson = new NuageAccount("Dropbox", json.name.display_name, json.email, json.profile_photo_url);
    mainCallback(res, accountJson);
  }

  create_newFolder(path, res, mainCallback){
    var data = {
      path: path
    }
    this.rest_api('POST', 'files/create_folder', this.simpleResponse, res, JSON.stringify(data), mainCallback);
  }

  move(from_path, to_path, res, mainCallback){
    var data = {
      from_path: from_path,
      to_path: to_path
    }
    this.rest_api('POST', 'files/move', this.simpleResponse, res, JSON.stringify(data), mainCallback);
  }

  delete(path, res, mainCallback){
    var data = {
      path: path
    }
    this.rest_api('POST', 'files/delete', this.simpleResponse, res, JSON.stringify(data), mainCallback);
  }

  simpleResponse(data, res, mainCallback){
    mainCallback(res,'Ok');
  }

  rest_api(method, f, callback, res, data, mainCallback) {
    var options = {
      host: 'api.dropboxapi.com',
      path: '/2/' + f,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': "Bearer " + this.bearer
      },
      method: method,
      port: 443
    };
    this.httpRequest(data, options, callback, res, mainCallback);
  }

  /****** UTIL ******/

  httpRequest(data, options, callback, response, mainCallback) {
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
            callback(content, response, mainCallback);
        } else {
          console.log('Status:', res.statusCode);
          console.log(content);
        }
      });
    }).on('error', function(err) {
      console.log('Error:', err);
    });;

    if (typeof data === 'undefined') {

    } else {
      req.write(data);
    }
    req.end()
  }
}

module.exports = DropboxConnector;