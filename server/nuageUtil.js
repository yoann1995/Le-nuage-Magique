var https = require('https');

class NuageUtil {

	static httpRequest(data, options, callback, response, mainCallback) {
		var req = https.request(options, function(res) {
			res.setEncoding('utf8');
			let content = '';
			res.on('data', function(chunk) {
				content += chunk;
			});
			res.on('end', function() {
				if (res.statusCode === 200 || res.statusCode === 204) {
					if (typeof callback === 'undefined')
						console.log(content);
					else
						callback(content, response, mainCallback);
				} else {
					console.log('Status:', res.statusCode);
					//console.log(content);
					NuageUtil.err(res, res.statusCode);
				}
			});
		}).on('error', function(err) {
			NuageUtil.err(res, err);
		});;

		if (typeof data === 'undefined') {

		} else {
			req.write(data);
		}
		req.end()
	}

	static rep(data, res, mainCallback){
		let json = {'Success': 'Operation suceed'};
  		res.end(JSON.stringify(json));
  	}

  	static err(res, msg){
  		let json = {'Error': msg};
  		res.end(JSON.stringify(json));
  	}
}

module.exports = NuageUtil;