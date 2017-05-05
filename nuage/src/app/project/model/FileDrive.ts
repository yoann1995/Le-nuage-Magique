export class FileDrive {

	public fileIcon = "assets/ic_insert_drive_file_black_24dp_1x.png";
	public folderIcon = "assets/ic_folder_black_24dp_1x.png";

	/**
	 * sources json format : { "name":"<GoogleDrive|Dropbox>", "id":"<id>" }
	 */
	constructor(public name : string,
				public childrens : Array<FileDrive>, public type : string,
				public size:number, public sources, public isShared:boolean) {
	}

	public getIconURL():string{
		if(this.childrens.length > 0 || this.type == "folder"){
			return this.folderIcon;
		} else {
			return this.fileIcon;
		}
	}

	/**
	 * Remove a child file so it is removed from the entire file tree
	 */
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
