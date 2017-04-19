
export class FileDrive {
	public fileIcon = "assets/ic_insert_drive_file_black_24dp_1x.png"; //File icon by default
	public folderIcon = "assets/ic_folder_black_24dp_1x.png"; //File icon by default
	constructor(public id : string, public name : string, public childrens : Array<FileDrive>, private typeRaw : string, public size:number) {
	}

	public getIconURL():string{
		if(this.childrens.length > 0){
			return this.folderIcon;
		} else {
			return this.fileIcon;
		}
	}
}
