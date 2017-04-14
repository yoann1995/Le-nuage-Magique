var https = require('https');

var client_id = '739612828231-qu956bv1d3f2i17d4rnmsgf002cqc7e7.apps.googleusercontent.com';
var scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly';
var redirect_uri = 'http://localhost:8080/authGoogleDrive';


function phase1(){
    var options = {
        host: 'accounts.google.com',
        path: '/o/oauth2/v2/auth?scope='+scope+'&state=state_parameter_passthrough_value&redirect_uri='+redirect_uri+'&access_type=offline&response_type=code&client_id='+client_id,
        headers: {'User-Agent': 'request'}
    };
}

https.get(options, function (res) {
    var json = '';
    res.on('data', function (chunk) {
        json += chunk;
    });
    res.on('end', function () {
        if (res.statusCode === 200) {
            try {
                var data = JSON.parse(json);
                // data is available here:
                console.log(data.html_url);
            } catch (e) {
                console.log('Error parsing JSON!');
            }
        } else {
            console.log('Status:', res.statusCode);
        }
    });
}).on('error', function (err) {
      console.log('Error:', err);
});