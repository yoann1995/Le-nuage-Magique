var querystring = require('querystring');

var NuageConst = require("./nuageConst");
var NuageUtil = require("./nuageUtil");
var NuageFile = require("./nuageFile");
var NuageUsage = require("./nuageUsage");
var NuageAccount = require("./nuageAccount");

var client_id = '739612828231-qu956bv1d3f2i17d4rnmsgf002cqc7e7.apps.googleusercontent.com';
var scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive';
var redirect_uri = 'http://localhost:8080/authGoogleDrive';
var client_secret = 'rdlvoJUZMBBj3RuI_Wyb-39a';

var rest_api_url = 'https://www.googleapis.com/drive/v3';

class GoogleDriveConnector {
	constructor() {
		this.bearer = '';
	}

	static getConnexionURL() {
		return 'https://accounts.google.com/o/oauth2/v2/auth?scope=' + scope + '&state=state_parameter_passthrough_value&redirect_uri=' + redirect_uri + '&access_type=online&response_type=code&client_id=' + client_id;
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
			host: 'www.googleapis.com',
			path: '/oauth2/v4/token',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data)
			},
			method: 'POST',
			port: 443
		};
		console.log('data', data);
		NuageUtil.httpRequest(data, options, this.setBearer.bind(this), res);
	}

	setBearer(b, res) {
		let json = JSON.parse(b);
		this.bearer = json.access_token;
		console.log('GoogleDrive : OK\nbearer:', this.bearer);
		res.redirect(NuageConst.URL_AFTER_CONNECT);
		//res.end('Bearer OK')
	}

	/*** FUN LIST ***/

	space_usage(res, mainCallback) {
		//fields : storageQuota
		let data;
		var options = {
			host: 'www.googleapis.com',
			path: '/drive/v3/about?fields=storageQuota&access_token=' + this.bearer,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			method: 'GET',
			port: 443
		};
		NuageUtil.httpRequest(data, options, this.extractSpaceUsage, res, mainCallback);
	}

	extractSpaceUsage(data, res, mainCallback) {
		var json = JSON.parse(data);
		let u = new NuageUsage(json.storageQuota.usage, json.storageQuota.limit);
		let dict = {
		  	name: "GoogleDrive",
		 	used: u.used,
		 	total : u.total
		};
		mainCallback(res, dict);
		//res.end(JSON.stringify(o));
	}

	files(res, mainCallback) {
		var options = {
			host: 'www.googleapis.com',
			path: '/drive/v2/files?orderBy=folder&maxResults=2000&access_token=' + this.bearer,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			method: 'GET',
			port: 443
		};
		let data;
		NuageUtil.httpRequest(data, options, this.extractFiles.bind(this), res, mainCallback);
	}

	searchItem(parent, id) {
		if (parent.id === id)
			return parent;
		else if (parent.children.length > 0) {
			let result = null;
			for (var i = 0; result == null && i < parent.children.length; i++) {
				result = this.searchItem(parent.children[i], id);
			}
			return result;
		}
		return null;
	}

	extractFiles(data, res, mainCallback) {
		let json = JSON.parse(data);
		let fileList = [];
		let fileList2 = [];
		for (var i = 0; i < json.items.length; i++) {
			let obj = json.items[i];
			let kind = obj.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file';
			let n = new NuageFile(obj.title, kind);
			n.size = obj.fileSize;
			let dict = {
			  name: "GoogleDrive",
			  id: obj.id
			};
			n.sources.push(dict);
			let parent = fileList;
			for (var j = 0; j < obj.parents.length; j++) {
				if (obj.parents[j].isRoot) {
					parent = fileList2;
				} else {
					n.parentId = obj.parents[j].id;
				}
			}
			parent.push(n);
		}

		var a = 1,
			b = 0; // Must be fileList.length==0 but -_(-.-)_-
		while (a > 0) {
			a = 0;

			for (var i = 0; i < fileList.length; i++) {
				for (var j = 0; j < fileList2.length; j++) {
					let m = this.searchItem(fileList2[j], fileList[i].parentId);
					if (m !== null) {
						m.children.push(fileList[i]);
						delete fileList[i].parentId;
						a++;
						break;
					}
				}
			}
			//console.log(a);
			b++;
			if (b > 50)
				break;
		}
		mainCallback(res, fileList2);
	}


	account_infos(res, mainCallback) {
		let data;
		var options = {
			host: 'www.googleapis.com',
			path: '/drive/v3/about?fields=user&access_token=' + this.bearer,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			method: 'GET',
			port: 443
		};
		NuageUtil.httpRequest(data, options, this.extractAccountInfos, res, mainCallback);
	}

	extractAccountInfos(data, res, mainCallback) {
		let json = JSON.parse(data);
		let accountJson = new NuageAccount("GoogleDrive", json.user.displayName, json.user.emailAddress, json.user.photoLink);
		mainCallback(res, accountJson);
	}

	create_newFolder(name, idParent, res, mainCallback){
		let data = JSON.stringify({
			"name": name,
  			"mimeType": "application/vnd.google-apps.folder",
  			"parents": [
    			idParent
  			]
		});

		var options = {
			host: 'www.googleapis.com',
			path: '/drive/v3/files',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(data),
				'Authorization': 'Bearer '+this.bearer
			},
			method: 'POST',
			port: 443
		};
		NuageUtil.httpRequest(data, options, NuageUtil.rep, res, mainCallback);
	}

	rename(id, name, res, mainCallback){
		let data = JSON.stringify({
			"name": name
		});

		var options = {
			host: 'www.googleapis.com',
			path: '/drive/v3/files/'+id,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(data),
				'Authorization': 'Bearer '+this.bearer
			},
			method: 'PATCH',
			port: 443
		};
		NuageUtil.httpRequest(data, options, NuageUtil.rep, res, mainCallback);
	}

	delete(id, res, mainCallback) {
		let data;
		var options = {
			host: 'www.googleapis.com',
			path: '/drive/v3/files/' + id + '?access_token=' + this.bearer,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			method: 'DELETE',
			port: 443
		};
		NuageUtil.httpRequest(data, options, NuageUtil.rep, res, mainCallback);
	}

	upload(file, filename, mimetype, res, mainCallback){
		let data ;
		var options = {
			host: 'www.googleapis.com',
			path: '/upload/drive/v3/files?name=test&uploadType=media',
			headers: {
				'Content-Type': mimetype,
				'Authorization': 'Bearer '+this.bearer
			},
			method: 'POST',
			port: 443
		};
		console.log(mimetype);
		return NuageUtil.getHttpRequest(data, options, this.afterUpload.bind(this), res, mainCallback, filename);
	}

	afterUpload(data, res, mainCallback, filename){
		let json = JSON.parse(data);
		
		data = JSON.stringify({
			"name": filename,
			"mimeType": mimetype
		});

		var options = {
			host: 'www.googleapis.com',
			path: '/drive/v3/files/'+json.id,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(data),
				'Authorization': 'Bearer '+this.bearer
			},
			method: 'PATCH',
			port: 443
		};
		NuageUtil.httpRequest(data, options, NuageUtil.rep, res, mainCallback);
	}

}

module.exports = GoogleDriveConnector;