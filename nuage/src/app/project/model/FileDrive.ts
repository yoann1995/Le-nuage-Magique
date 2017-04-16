
export class FileDrive {
	public icon = "assets/ic_insert_drive_file_black_24dp_1x.png"; //File icon by default
	constructor(public id : string, public name : string, public childrens : Array<FileDrive>, private typeRaw : string, public size:number) {
		if(typeRaw == "drive#folder"){ //If the file is a folder
			this.icon =  "assets/ic_folder_black_24dp_1x.png";
		}
	}
}
