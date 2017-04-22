export class FileDrive {
	public fileIcon = "assets/ic_insert_drive_file_black_24dp_1x.png"; //File icon by default
	public folderIcon = "assets/ic_folder_black_24dp_1x.png"; //File icon by default
	constructor(public name : string,
				public childrens : Array<FileDrive>, private type : string,
				public size:number, public sources) {
	}

	public getIconURL():string{
		if(this.childrens.length > 0){
			return this.folderIcon;
		} else {
			return this.fileIcon;
		}
	}

	public getSourceURL():string{
		console.log(this.sources);
		for (let i of this.sources) {
		   	if(i.name==="GoogleDrive"){
				return "assets/googledrive.png";
			} else if(i.name==="Dropbox"){
				return "assets/dropbox.png";
			} else if(i.name==="OneDrive"){
				return "assets/onedrive.png";
			} else {
				return "assets/ic_settings_black_24dp_1x.png";
			}
		}
		return "assets/ic_settings_black_24dp_1x.png";
	}

	public removeChild(child:FileDrive) : boolean{
		let index:number = this.childrens.indexOf(child);
		if(index>-1){
			this.childrens.splice(index,1);
			return true;
		} else {
			return false;
		}
	}
}
