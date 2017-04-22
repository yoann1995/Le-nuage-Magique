var NuageConst = require("./nuageConst");

class NuageAccount {
  constructor(src, name, email, picture) {
  	this.source = src;
    this.name = name;
    this.email = email;
    if (typeof picture === 'undefined')
    	this.picture = NuageConst.IMAGE_PROFILE_BASE;
    else
    	this.picture = picture;
  }
}

module.exports = NuageAccount;