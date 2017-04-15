class NuageFile {
  constructor(id, name, type) {
    this.children = []; 
    this.sources = [];
    this.size = 0;
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

module.exports = NuageFile;