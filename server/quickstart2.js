var fs = require('fs');
var express = require('express');
var rand = require("generate-key");
var session = require('client-sessions');
var https = require('https');
var simpleBarrier = require('simple-barrier');
var busboy = require('connect-busboy');

var NuageUtil = require("./nuageUtil");


/***** CONNECTORS *****/
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
var listFiles;

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

/***** AUTH *****/

app.get('/authDropbox', function(req, res) {
  console.log("/authDropbox called");
  DC.getToken(req.query.code, res);
  connectorList.push(DC);
});

app.get('/authGoogleDrive', function(req, res) {
  console.log("/authGoogleDrive called");
  GDC.getToken(req.query.code, res);
  connectorList.push(GDC);
});


/***** LIST FILES *****/

app.get('/listFiles', function(req, res) {
  console.log("/listFiles called");
  if(connectorList.length===0)
    NuageUtil.err(res, 'No connector pluged');


  let barrier = simpleBarrier();
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].files(res, barrier.waitOn(mergelistFiles));
  }

  barrier.endWith(function(json) {
    console.log("/listFiles ok");
    let json1 = json[0];
    for(var i = 0; i < json.length - 1; i++){
      merge(json1,json[i+1]);
    }
    listFiles = json1;
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
      }
    }
  }

  for (var j = 0; j < json2.length; j++) { //Only not added file
    var o2 = json2[j];
    if(o2.added != true)
      json1.push(o2);
  }
}

app.get('/listFiles/Dropbox', function(req, res) {
  console.log("/listFiles/Dropbox called");
  DC.files(res, writeOutJSON);
});

app.get('/listFiles/GoogleDrive', function(req, res) {
  console.log("/listFiles/GoogleDrive called");
  GDC.files(res, writeOutJSON);
});

function mergelistFiles(res, data) {
  return data;
}

/***** SPACE USAGE *****/

app.get('/spaceUsage', function(req, res) {
  console.log('/spaceUsage called');
  if(connectorList.length===0)
    NuageUtil.err(res, 'No connector pluged');

  let barrier = simpleBarrier();
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].space_usage(res, barrier.waitOn(mergeSpaceUsage));
  }
  barrier.endWith(function(json) {
    console.log('/spaceUsage ok');
    res.end(JSON.stringify(json));
  });
});

app.get('/spaceUsage/Dropbox', function(req, res) {
  console.log('/spaceUsage/Dropbox called');
  DC.space_usage(res, writeOutJSON);
});

app.get('/spaceUsage/GoogleDrive', function(req, res) {
  console.log('/spaceUsage/GoogleDrive called');
  GDC.space_usage(res, writeOutJSON);
});

function mergeSpaceUsage(res, data) {
  return data;
}


/***** ACCOUNT INFOS *****/

app.get('/accountInfos', function(req, res) {
  console.log('/accountInfos called');
  if(connectorList.length===0)
    NuageUtil.err(res, 'No connector pluged');

  let barrier = simpleBarrier();
  for (var i = 0; i < connectorList.length; i++) {
    connectorList[i].account_infos(res, barrier.waitOn(mergeAccountInfos));
  }

  barrier.endWith(function(json) {
    console.log('/accountInfos ok');
    res.end(JSON.stringify(json));
  });
});

app.get('/accountInfos/Dropbox', function(req, res) {
  console.log('/accountInfos/Dropbox called');
  DC.account_infos(res, writeOutJSON);
});

app.get('/accountInfos/GoogleDrive', function(req, res) {
  console.log('/accountInfos/GoogleDrive called');
  GDC.account_infos(res, writeOutJSON);
});

function mergeAccountInfos(res, data) {
  return data;
}

/***** DELETE FILE *****/
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
  console.log('/delete/Dropbox called');
  DC.delete(req.query.path, res, writeOutJSON);
  NuageUtil.rep('',res);
});

app.get('/delete/GoogleDrive', function(req, res) {
  console.log('/delete/GoogleDrive called');
  GDC.delete(req.query.id, res, writeOutJSON);
  NuageUtil.rep('',res);
});

app.get('/delete2/Dropbox', function(req, res) {
  console.log('/delete2/Dropbox called');
  let item = search(listFiles,req.query.id, 'Dropbox');
  if(item === null)
    NuageUtil.err(res, 'Not item found');
  DC.delete(searchIdSource(item,'Dropbox', res, writeOutJSON));
  NuageUtil.rep('',res);
});

app.get('/delete2/GoogleDrive', function(req, res) {
  console.log('/delete2/GoogleDrive called');
  let item = search(listFiles,req.query.id, 'GoogleDrive');
  if(item === null)
    NuageUtil.err(res, 'Not item found');
  GDC.delete(searchIdSource(item,'GoogleDrive', res, writeOutJSON));
  NuageUtil.rep('',res);
});

/***** ADD NEW FOLDER *****/

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
  console.log('/addNewFolder/Dropbox called');
  DC.create_newFolder(req.query.path, res, writeOutJSON);
  NuageUtil.rep('',res)
  /* TODO : Give back the new folder infos to update client */
});

app.get('/addNewFolder/GoogleDrive', function(req, res) {
  console.log('/addNewFolder/GoogleDrive called');
  GDC.create_newFolder(req.query.name, req.query.idparent, res, writeOutJSON);
  /* TODO : Give back the new folder infos to update client */
  NuageUtil.rep('',res)
});

app.get('/move/Dropbox', function(req, res) {
  console.log('/move/Dropbox called');
  DC.move(req.query.from_path, req.query.to_path, res, writeOutJSON);
  NuageUtil.rep('',res);
});

app.get('/move/GoogleDrive', function(req, res) {
  console.log('/move/GoogleDrive called');
  GDC.move(req.query.id, req.query.newIdParent, req.query.oldIdParent, res, writeOutJSON);
});


/***** UPLOAD *****/

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
  console.log('/upload/Dropbox called');
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
  //DC.upload(req.files.fileToUpload, res, writeOutJSON);
  // res.redirect('http://localhost:4200/files');
  NuageUtil.rep('',res);
});


app.post('/upload/GoogleDrive', function(req, res) {
  console.log('/upload/GoogleDrive called');
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
  // res.redirect('http://localhost:4200/files');
  NuageUtil.rep('',res);
});

/***** RENAME *****/

app.get('/rename/Dropbox', function(req, res) {
  console.log('/rename/Dropbox called');
  DC.rename(req.query.path, req.query.name, res, writeOutJSON);
  NuageUtil.rep('',res)
});

app.get('/rename/GoogleDrive', function(req, res) {
  console.log('/rename/GoogleDrive called');
  GDC.rename(req.query.id, req.query.name, res, writeOutJSON);
  NuageUtil.rep('',res)
});

/***** CONNECT *****/

app.get('/connect/Dropbox', function(req, res) {
  console.log('/connect/Dropbox called');
  res.redirect(DropboxConnector.getConnexionURL());
  //res.end('<a href="'+DropboxConnector.getConnexionURL()+'">Link</a>')
});

app.get('/connect/GoogleDrive', function(req, res) {
  console.log('/connect/GoogleDrive called');
  res.redirect(GoogleDriveConnector.getConnexionURL());
  //res.end('<a href="'+GoogleDriveConnector.getConnexionURL()+'">Link</a>')
});

/***** DISCONNECT *****/

app.get('/disconnect/Dropbox', function(req, res) {
  console.log('/disconnect/Dropbox called');
  connectorList.splice(connectorList.indexOf(DC),1);
  console.log("Dropbox account disconnected.");
  res.redirect('http://localhost:4200/home');
});

app.get('/disconnect/GoogleDrive', function(req, res) {
  console.log('/disconnect/GoogleDrive called');
  connectorList.splice(connectorList.indexOf(GDC),1);
  console.log("GoogleDrive account disconnected.");
  res.redirect('http://localhost:4200/home');
});

/***** ECHO *****/

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

function search(listFiles, id, source) {
  let result = null;
  for (var i = 0; result == null && i < listFiles.length; i++) {
    result = searchItem(listFiles[i], id, source);
  }
  return result;
}

function searchItem(parent, id, source) {
  if (parent.id === id && hasThisSource(parent, source))
    return parent;
  else if (parent.children.length > 0) {
    let result = null;
    for (var i = 0; result == null && i < parent.children.length; i++) {
      result = searchItem(parent.children[i], id);
    }
    return result;
  }
  return null;
}

function hasThisSource(parent, source){
  if(typeof source == 'undefined')
    return true;
  for (var i = 0; i < parent.sources.length; i++) {
    if(parent.sources[i] === source)
      return true;
  }
  return false;
}

function searchIdSource(item, source){
  if(typeof source == 'undefined')
    return null;
  for (var i = 0; i < item.sources.length; i++) {
    if(item.sources[i].name === source)
      return item.sources[i].id;
  }
  return null;
}

/***** MAIN *****/

app.listen(8080, function() {
  console.log('NuageMagique server running on port 8080! =D');
});
