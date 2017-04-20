class NuageFile {
  constructor(id, name, type) {
    this.children = []; 
    this.sources = [];
    this.size = 0;
    this.name = name;
    this.type = type;
    this.id = id;
  }
}

module.exports = NuageFile;