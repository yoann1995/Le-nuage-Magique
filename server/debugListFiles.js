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
  let json = JSON.parse(data);
  let fileList = [];
  let fileList2 = [];
  for (var i = 0; i < json.items.length; i++){
    let obj = json.items[i];
    let n = new NuageFile(obj.id,obj.title,obj.kind);
    n.sources.push('GoogleDrive');
    let parent = fileList;
    for (var j = 0; j < obj.parents.length; j++){
     if(obj.parents[j].isRoot){
      parent = fileList2;
     }
     else{
     	n.parentId = obj.parents[j].id;
     }
    }
    parent.push(n);
  }

  var a =1 , b =0; // Must be fileList.length==0 but -__(-.-)__-
  while(a>0){
  	a=0;
  	
	for (var i = 0; i < fileList.length; i++){
     	for (var j = 0; j < fileList2.length; j++){
     		let m = searchItem(fileList2[j], fileList[i].parentId);
     		if(m !== null){
     			m.children.push(fileList[i]);
     			delete fileList[i].parentId;
     			a++;
     			break;
     		}
    	}
    }
    console.log(a);
    b++;
    if(b>50)
    	break;
}

  //console.log(fileList);
  res.end(JSON.stringify(fileList2));
}

function searchItem(parent, id){
	if(parent.id === id)
		return parent;
	else if(parent.children.length>0){
		result = null;
		for (var i = 0;result == null && i < parent.children.length; i++){
	    	result = searchItem(parent.children[i], id);
	    }
	    return result;
	}
	return null;
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