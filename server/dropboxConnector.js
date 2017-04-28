var querystring = require('querystring');

var NuageConst = require("./nuageConst");
var NuageUtil = require("./nuageUtil");
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
    NuageUtil.httpRequest(data, options, this.setBearer.bind(this), res);
  }

  setBearer(b, res) {
    let json = JSON.parse(b);
    this.bearer = json.access_token;
    console.log('Dropbox : OK\nbearer:', this.bearer);
    res.redirect(NuageConst.URL_AFTER_CONNECT);
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
    let dict = {
      name: "Dropbox",
      used: u.used,
      total : u.total
    };
    mainCallback(res, dict);
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
    let json = JSON.parse(data);
    let fileList = [];
    for (let i = 0; i < json.entries.length; i++) {
      let obj = json.entries[i];
      let n = new NuageFile(obj.name, json.entries[i]['.tag']);
      let dict = {
        name: "Dropbox",
        id: obj.path_display
      };
      n.sources.push(dict);
      let parent = fileList;
      let path_display = obj.path_display;
      while (path_display != ('/' + obj.name)) {
        let p = path_display.substring(1, path_display.indexOf("/", 1));
        for (let j = 0; j < parent.length; j++) {
          if (parent[j].name == p) {
            parent = parent[j].children;
          }
        }
        path_display = path_display.substring(path_display.indexOf("/", 1), path_display.length);
        //break; ASKIP CA MARCHE SANS
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
    let json = JSON.parse(data);
    //console.log(json);
    let accountJson = new NuageAccount("Dropbox", json.name.display_name, json.email, json.profile_photo_url);
    mainCallback(res, accountJson);
  }

  create_newFolder(path, res, mainCallback){
    var data = {
      path: path
    }
    this.rest_api('POST', 'files/create_folder', NuageUtil.rep, res, JSON.stringify(data), mainCallback);
  }

  upload(file, filename, path, res, mainCallback){
    var data = {
      "path": path+"/"+filename,
      "mode": "add",
      "autorename": true,
      "mute": false
    }

    var options = {
      host: 'content.dropboxapi.com',
      path: '/2/files/upload',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': "Bearer " + this.bearer,
        'Dropbox-API-Arg': JSON.stringify(data)
      },
      method: 'POST',
      port: 443
    };
    return NuageUtil.getHttpRequest(data, options, NuageUtil.rep, res, mainCallback);
  }

  move(from_path, to_path, res, mainCallback){
    var data = {
      from_path: from_path,
      to_path: to_path
    }
    this.rest_api('POST', 'files/move', NuageUtil.rep, res, JSON.stringify(data), mainCallback);
    res.redirect("http://localhost:4200/files");
  }

  rename(path, name, res, mainCallback){
    this.move(path, path.substring(path.lastIndexOf("/"), path.length)+"/"+name, res, mainCallback);
  }

  delete(path, res, mainCallback){
    var data = {
      path: path
    }
    this.rest_api('POST', 'files/delete', NuageUtil.rep, res, JSON.stringify(data), mainCallback);
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
    NuageUtil.httpRequest(data, options, callback, res, mainCallback);
  }
}

module.exports = DropboxConnector;
