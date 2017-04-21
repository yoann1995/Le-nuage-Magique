class NuageAccount {
  constructor(src, name, email, picture) {
  	this.source = src;
    this.name = name;
    this.email = email;
    if (typeof picture === 'undefined')
    	this.picture = 'https://cfl.dropboxstatic.com/static/images/avatar/faceholder-64-vflHTEplh.png';
    else
    	this.picture = picture;
  }
}

module.exports = NuageAccount;