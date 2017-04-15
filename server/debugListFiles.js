var express = require('express');
var app = express();
var fs = require("fs");
var NuageFile = require("./nuageFile");

app.get('/listFiles/Dropbox', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
    fs.readFile( __dirname + "/" + "jsonDropbox.json", 'utf8', function (err, data) {
       console.log( 'json' );
       extractFilesDropbox(data,res);
       //res.end( data );
   });
});

app.get('/listFiles/GoogleDrive', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
    fs.readFile( __dirname + "/" + "jsonDrive.json", 'utf8', function (err, data) {
       console.log( 'json' );
       extractFilesGoogleDrive(data,res);
       //res.end( data );
   });
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

function extractFilesGoogleDrive(data, res){
  json = JSON.parse(data);
  var fileList = [];
  var fileList2 = [];
  for (var i = 0; i < json.items.length; i++){
    var obj = json.items[i];
    n = new NuageFile(obj.id,obj.title,obj.kind);
    n.sources.push('GoogleDrive');
    parent = fileList;
    for (var j = 0; j < obj.parents.length; j++){
    	if(obj.parents[j].isRoot){
    		parent = fileList2;
    	}
    }
    /*path_display = obj.path_display;
    while(path_display != ('/'+obj.name)){
    	console.log('Je rentre');
    	p = path_display.substring(1, path_display.indexOf("/",1));
    	for (var i = 0; i < parent.length; i++){
    		if(parent[i].name == p){
    			parent = parent[i].children;
			}
		}
    	path_display = path_display.substring(path_display.indexOf("/",1), path_display.length);
    	break;
    }*/
    parent.push(n);
  }
  console.log(fileList);
  res.end(JSON.stringify(fileList2));
}

function extractFilesDropbox(data, res){
  json = JSON.parse(data);
  var fileList = [];
  for (var i = 0; i < json.entries.length; i++){
    var obj = json.entries[i];
    n = new NuageFile(obj.id,obj.name,json.entries[i]['.tag']);
    n.sources.push('Dropbox');
    parent = fileList;
    path_display = obj.path_display;
    while(path_display != ('/'+obj.name)){
    	console.log('Je rentre');
    	p = path_display.substring(1, path_display.indexOf("/",1));
    	for (var i = 0; i < parent.length; i++){
    		if(parent[i].name == p){
    			parent = parent[i].children;
			}
		}
    	path_display = path_display.substring(path_display.indexOf("/",1), path_display.length);
    	break;
    }
    parent.push(n);
  }
  console.log(fileList);
  res.end(JSON.stringify(fileList));
}