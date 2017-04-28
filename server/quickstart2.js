var fs = require('fs');
var express = require('express');
var rand = require("generate-key");
var session = require('client-sessions');
var https = require('https');
var simpleBarrier = require('simple-barrier');
var busboy = require('connect-busboy');

var NuageUtil = require("./nuageUtil");


/**** CONNECTOR ****/
var GoogleDriveConnector = require("./googleDriveConnector");
var DropboxConnector = require("./dropboxConnector");

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.use(busboy());
app.use(allowCrossDomain);

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
      console.log('Error loading wiki file: ' + err);
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
  if(connectorList.length===0)
    NuageUtil.err(res, 'No connector pluged');


  let barrier = simpleBarrier();
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].files(res, barrier.waitOn(mergelistFiles));
  }

  barrier.endWith(function(json) {
    let json1 = json[0];
    for(var i = 0; i < json.length - 1; i++){
      merge(json1,json[i+1]);
    }
    console.log('/listFiles');
    res.end(JSON.stringify(json1));
  });
});

function merge(json1, json2) {
  let temp = []
  for (var i = 0; i < json1.length; i++) {
    var o1 = json1[i];
    for (var j = 0; j < json2.length; j++) {
      var o2 = json2[j];
      if (o1.name === o2.name) {
        o1.sources = o1.sources.concat(o2.sources);
        merge(o1.children, o2.children);
        o2.added = true;
        //break;
      }
    }
  }

  for (var j = 0; j < json2.length; j++) { //Only not added file
    var o2 = json2[j];
    if(o2.added != true)
      json1.push(o2);
  }
}

app.get('/listFiles/GoogleDrive', function(req, res) {
  GDC.files(res, writeOutJSON);
});

app.get('/listFiles/Dropbox', function(req, res) {
  DC.files(res, writeOutJSON);
});

function mergelistFiles(res, data) {
  return data;
}

/****** SPACE USAGE ******/

app.get('/spaceUsage', function(req, res) {
  if(connectorList.length===0)
    NuageUtil.err(res, 'No connector pluged');

  let barrier = simpleBarrier();
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].space_usage(res, barrier.waitOn(mergeSpaceUsage));
  }
  barrier.endWith(function(json) {
    console.log('/spaceUsage');
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
  if(connectorList.length===0)
    NuageUtil.err(res, 'No connector pluged');

  let barrier = simpleBarrier();
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].account_infos(res, barrier.waitOn(mergeAccountInfos));
  }

  barrier.endWith(function(json) {
    console.log('/accountInfos');
    res.end(JSON.stringify(json));
  });
});

app.get('/accountInfos/Dropbox', function(req, res) {
  DC.account_infos(res, writeOutJSON);
});

app.get('/accountInfos/GoogleDrive', function(req, res) {
  GDC.account_infos(res, writeOutJSON);
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
  NuageUtil.rep('',res)
  /* TODO : Give back the new folder infos to update client */
});

app.get('/addNewFolder/GoogleDrive', function(req, res) {
  GDC.create_newFolder(req.query.name, req.query.id_parent, res, writeOutJSON);
  NuageUtil.rep('',res)
  /* TODO : Give back the new folder infos to update client */
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

app.get('/move/Dropbox', function(req, res) {
  DC.move(req.query.from_path, req.query.to_path, res, writeOutJSON);
});
/*
app.get('/move/GoogleDrive', function(req, res) {
  GDC.move(req.query.id, res, writeOutJSON);
});
*/

/***** UPLOAD ***/
/*app.get('/upload', function(req, res) {
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
app.post('/upload/Dropbox', function(req, res) {
  var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log("Uploading: " + filename); 
        let path = ''; //ça ne marche po :(
        file.pipe(DC.upload(file, filename, path, res, writeOutJSON));
        
        /*fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });*/
    });
  //GDC.upload(req.files.fileToUpload, res, writeOutJSON);
  res.redirect('http://localhost:4200/files');
});
app.post('/upload/GoogleDrive', function(req, res) {
  var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log("Uploading: " + filename); 
        file.pipe(GDC.upload(file, filename, mimetype, res, writeOutJSON));
        
        /*fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.redirect('back');
        });*/
    });
  //GDC.upload(req.files.fileToUpload, res, writeOutJSON);
  res.redirect('http://localhost:4200/files');
});


/***** RENAME ***/
app.get('/rename/GoogleDrive', function(req, res) {
  GDC.rename(req.query.id, req.query.name, res, writeOutJSON);
  NuageUtil.rep('',res)
  //res.redirect('http://localhost:4200/files');
});

app.get('/rename/Dropbox', function(req, res) {
  DC.rename(req.query.path, req.query.name, res, writeOutJSON);
  NuageUtil.rep('',res)
  //res.redirect('http://localhost:4200/files');
});
/****** CONNECT *******/

app.get('/connect/GoogleDrive', function(req, res) {
  res.redirect(GoogleDriveConnector.getConnexionURL());
  //res.end('<a href="'+GoogleDriveConnector.getConnexionURL()+'">Link</a>')
});

app.get('/connect/Dropbox', function(req, res) {
  res.redirect(DropboxConnector.getConnexionURL());
  //res.end('<a href="'+DropboxConnector.getConnexionURL()+'">Link</a>')
});

/****** DISCONNECT *******/
app.get('/disconnect/GoogleDrive', function(req, res) {
  connectorList.splice(connectorList.indexOf(GDC),1);
  console.log("GoogleDrive account disconnected.");
  res.redirect('http://localhost:4200/home');
});

app.get('/disconnect/Dropbox', function(req, res) {
  connectorList.splice(connectorList.indexOf(DC),1);
  console.log("Dropbox account disconnected.");
  res.redirect('http://localhost:4200/home');
});

/**** ECHO ****/

app.get('/success', function(req, res) {
  NuageUtil.rep('',res);
});

app.get('/error', function(req, res) {
  NuageUtil.err(res, 'It works !');
});

/***** UTIL *****/

function writeOutJSON(res, data) {
  res.end(JSON.stringify(data));
}

/***** MAIN *****/


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
