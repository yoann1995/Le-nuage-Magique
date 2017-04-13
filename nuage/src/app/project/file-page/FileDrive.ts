
export class FileDrive {
	public icon = "assets/ic_folder_black_24dp_1x.png"; //File icon by default
	constructor(public id : string, public parent : string, public name : string, private typeRaw : string) {
		if(typeRaw === "application\/vnd.google-apps.folder"){ //If the file is a folder
			this.icon =  "assets/ic_insert_drive_file_black_24dp_1x.png";
		}
	}
}
