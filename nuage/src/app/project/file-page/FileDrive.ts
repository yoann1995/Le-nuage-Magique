
export class FileDrive {
	public icon = "assets/ic_folder_black_24dp_1x.png";
	constructor(public id : string, public parent : string, public name : string, private typeRaw : string) {
		if(typeRaw === "application\/vnd.google-apps.folder"){
			this.icon = "assets/ic_insert_drive_file_black_24dp_1x.png";
		}
	}

	/*private isAFile(v) {
	    for (let enumMember in fileType) {
	        if (enumMember === v) {
	            return true;
	        }
	    }
	    return false;
	}*/

}
