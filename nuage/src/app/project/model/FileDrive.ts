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
