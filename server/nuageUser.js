class NuageUser {
	constructor() {
		this.GDC = new GoogleDriveConnector();
		this.DC = new DropboxConnector();

		this.connectorList = [];
		this.listFiles;
	}
}

module.exports = NuageUser;
