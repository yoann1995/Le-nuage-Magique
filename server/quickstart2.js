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
var barrier3 = simpleBarrier();

GDC = new GoogleDriveConnector();
DC = new DropboxConnector();

connectorList = [];

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.get('/', function(req, res) {
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
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].files(res, barrier.waitOn(mergelistFiles));
  }
  var merged_json = [];
  barrier.endWith(function(json) {
    merged_json.push(json);
    /*let json1 = merged_json[0];
    for(var i = 1; i < merged_json.length; i++){
      merge(json1,merged_json[i+1]);
      i++;
    }*/
    //TEMP PARCE QUE JE NE SAIS PAS POURQUOI CA NE MARCHE PAS AUTREMENT
    merge(merged_json[0][0], merged_json[0][1]);
    res.end(JSON.stringify(merged_json[0][0]));
  });
});

function merge(json1, json2) {
  for (var i = 0; i < json1.length; i++) {
    var o1 = json1[i];
    for (var j = 0; j < json2.length; j++) {
      var o2 = json2[j];
      if (o1.name === o2.name) {
        o1.sources = o1.sources.concat(o2.sources);
        merge(o1.children, o2.children);
      }
    }
  }
}

app.get('/listFiles/GoogleDrive', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  GDC.files(res, writeOutJSON);
});

app.get('/listFiles/Dropbox', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  DC.files(res, writeOutJSON);
});

function mergelistFiles(res, data) {
  return data;
}

/****** SPACE USAGE ******/

app.get('/spaceUsage', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].space_usage(res, barrier2.waitOn(mergeSpaceUsage));
  }
  let merged_json = [];
  barrier2.endWith(function(json) {
    merged_json.push(json);
    console.log(json);
    res.end(JSON.stringify(json));
  });
});

app.get('/spaceUsage/Dropbox', function(req, res) {
  DC.space_usage(res, writeOutJSON);
});

app.get('/spaceUsage/GoogleDrive', function(req, res) {
  GDC.space_usage(res, writeOutJSON);
});

function mergeSpaceUsage(res, data) {
  return data;
}


/***** ACCOUNT INFOS ***/
app.get('/accountInfos', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].account_infos(res, barrier3.waitOn(mergeAccountInfos));
  }
  let merged_json = [];
  barrier3.endWith(function(json) {
    merged_json.push(json);
    console.log(json);
    res.end(JSON.stringify(json));
  });
});

app.get('/accountInfos/Dropbox', function(req, res) {
  DC.space_usage(res, writeOutJSON);
});

app.get('/accountInfos/GoogleDrive', function(req, res) {
  GDC.space_usage(res, writeOutJSON);
});

function mergeAccountInfos(res, data) {
  return data;
}

/***** DELETE FILE ***/
/*app.get('/delete', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  for(var i = 0; i < connectorList.length; i++){
    connectorList[i].account_infos(res, barrier3.waitOn(mergeAccountInfos));
  }
  let merged_json = [];
  barrier3.endWith(function( json ){
    merged_json.push(json);
    console.log(json);
    res.end(JSON.stringify(json));
  });
});*/

app.get('/delete/Dropbox', function(req, res) {
  DC.delete(req.query.path, res, writeOutJSON);
});

app.get('/delete/GoogleDrive', function(req, res) {
  GDC.delete(req.query.id, res, writeOutJSON);
});

/***** ADD NEW FOLDER ***/
/*app.get('/addNewFolder', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  for(var i = 0; i < connectorList.length; i++){
    connectorList[i].account_infos(res, barrier3.waitOn(mergeAccountInfos));
  }
  let merged_json = [];
  barrier3.endWith(function( json ){
    merged_json.push(json);
    console.log(json);
    res.end(JSON.stringify(json));
  });
});*/

app.get('/addNewFolder/Dropbox', function(req, res) {
  DC.create_newFolder(req.query.path, res, writeOutJSON);
});
/*
app.get('/addNewFolder/GoogleDrive', function(req, res) {
  GDC.create_newFolder(req.query.id, res, writeOutJSON);
});
*/
/***** ADD NEW FOLDER ***/
/*app.get('/addNewFolder', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  for(var i = 0; i < connectorList.length; i++){
    connectorList[i].account_infos(res, barrier3.waitOn(mergeAccountInfos));
  }
  let merged_json = [];
  barrier3.endWith(function( json ){
    merged_json.push(json);
    console.log(json);
    res.end(JSON.stringify(json));
  });
});*/

app.get('/move/Dropbox', function(req, res) {
  DC.move(req.query.from_path, req.query.to_path, res, writeOutJSON);
});
/*
app.get('/move/GoogleDrive', function(req, res) {
  GDC.move(req.query.id, res, writeOutJSON);
});
*/
/****** CONNECT *******/

app.get('/connect/GoogleDrive', function(req, res) {
  res.redirect(GoogleDriveConnector.getConnexionURL());
  //res.end('<a href="'+GoogleDriveConnector.getConnexionURL()+'">Link</a>')
});

app.get('/connect/Dropbox', function(req, res) {
  res.redirect(DropboxConnector.getConnexionURL());
  //res.end('<a href="'+DropboxConnector.getConnexionURL()+'">Link</a>')
});

/***** UTIL *****/

function writeOutJSON(res, data) {
  res.end(JSON.stringify(data));
}


/***** MAIN *****/


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});