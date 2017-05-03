var shortid = require('shortid');

class NuageFile {
	constructor(name, type) {
		this.children = [];
		this.sources = [];
		this.size = 0;
		this.name = name;
		this.type = type;
		this.id = shortid.generate();
		this.isShared = false;
	}
}

module.exports = NuageFile;
