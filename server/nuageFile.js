class NuageFile {
  constructor(name, type) {
    this.children = []; 
    this.sources = [];
    this.size = 0;
    this.name = name;
    this.type = type;
  }
}

module.exports = NuageFile;