import { Component, OnInit, ViewChild } from '@angular/core';
import { FileDrive } from '../model/FileDrive';
import { Http, Response, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { APIService } from '../model/api.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { StaticPageComponent } from '../static-page/static-page.component';

@Component({
  selector: 'app-file-page',
  templateUrl: './file-page.component.html',
  styleUrls: ['./file-page.component.css'],
})
export class FilePageComponent implements OnInit {

  // POPUP MODALS //
  @ViewChild('renamemodal')
  renamemodal: ModalComponent;
  @ViewChild('movemodal')
  movemodal: ModalComponent;
  @ViewChild('deletemodal')
  deletemodal: ModalComponent;
  @ViewChild('uploadmodal')
  uploadmodal: ModalComponent;
  @ViewChild('newfoldermodal')
  newfoldermodal: ModalComponent;

  public rootFolder : FileDrive; //The folder containing the first files (at the root)
  public stackFolder : Array<FileDrive>; //The stack trace of file tree
  public selectedFile : FileDrive; //The current selected file
  private previousSelectedFileRowColor:string; //The color of the row of the previous selected file to retrieve it
  private googleFilter:boolean = true; //True when we want it to be displayed
  private dropboxFilter:boolean = true;
  private upload:FileList; // The chosen file when uploading a file

  constructor(public api: APIService, private http: Http)  {}

  ngOnInit() {
    this.updateFiles();
  }

  /*
  * Build the file tree from a parent file with a file json
  */
  private addFilesToArray(parent:FileDrive, files){
      for(let file of files){
        //Create all the childrens from the json Documents
        var fd = new FileDrive(file.name,new Array<FileDrive>(), file.type, file.size, file.sources);
        // Going further into files tree
        if(file.children){
          this.addFilesToArray(fd, file.children); //Pass only the json's children part
        }
        //Add the childrens to the parent
        parent.childrens.push(fd);
      }
  }

  /**
   * @Triggered : Rename button
   * Rename the selected file  by the name entered in the field
   * @Callback : Update file tree
   */
  private renameFile(){
    if(this.selectedFile){
      let newFileName = (<HTMLInputElement>document.getElementById('new-file-name')).value;
      console.log("Renaming \'"+this.selectedFile.name+"\' by : "+newFileName);
      this.api.rename(this.selectedFile,newFileName).subscribe(
        rep => { this.selectedFile.name = newFileName; },
        err => { console.log(err); }
      );
      this.renamemodal.close();
    } else {
      console.log("NO SELECTED FILE!");
    }
  }

  /*
   * @Triggered : simple click
   * Select a file by clicking on it
   * @param the file to select
   */
  private selectFile(selected:FileDrive){
    //Restore the normal color of the previous selected file's row
    if(this.selectedFile){ //Check if there is a selected row already
      let previousSelected = document.getElementById(this.selectedFile.sources[0].id);
      previousSelected.style.backgroundColor = this.previousSelectedFileRowColor;
      previousSelected.style.color = "#000000";
    }

    //Color the new selected file's row
    let myFile = document.getElementById(selected.sources[0].id);
    this.previousSelectedFileRowColor = myFile.style.backgroundColor;
    myFile.style.backgroundColor = "#4193C7";
    myFile.style.color = "#FFFFFF";
    //Update the current selected file
    this.selectedFile = selected;
  }

  /*
  * @Triggered : double click 
  * Go inside a folder selected, get all its childrens, started by double clicking the file
  * @param file The file to go in
  */
  private goInSelectedFolder(file:FileDrive){
    //If the file has childrens
    if(file.type == "folder"){
      this.stackFolder.push(this.rootFolder); //Adding to stack path the previous root folder
      this.rootFolder = file;
      this.selectedFile = null; //There is no selected file anymore
    }
  }

  /*
   * @Triggered : Back arrow button
   * Return to the parent folder (above in the tree)
   */
  private goBack(){
    this.rootFolder = this.stackFolder.pop(); //Going back on the stack
  }

  /**
   * @Triggered : Settings icon
   * Go back to home page
   */
  private returnToSettings(){
    StaticPageComponent.reload();
    // window.location.href = "http://localhost:4200/home";
  }

  /*
   * @Triggered : Delete icon
   * Remove the current selected file
   */
  private deleteSelectedFile(){
    if(this.selectedFile){
      this.deleteFile(this.selectedFile);
      this.selectedFile = null;
    }
    this.deletemodal.close();
  }

  /*
   * @param fileToRemove : The file to remove from the current folder
   * Remove a file in the current folder
   * @Callback : Update file tree
   */
  private deleteFile(fileToRemove:FileDrive){
    if(fileToRemove){
      this.api.removeFile(fileToRemove).subscribe(
        rep => {
          this.rootFolder.removeChild(fileToRemove);
          /*this.updateFiles();*/
        },
        err => {console.log(err);
      });
      /*this.updateFiles();*/
    }
  }

  /**
   * @Triggered : Move icon
   * Move a file from its location to another
   * Use the path given in the field
   * @Callback : Update file tree
   */
  private moveFile(){
    if(this.selectedFile){
      let newPath = (<HTMLInputElement>document.getElementById('new-path')).value;
      console.log("Moving \'"+this.selectedFile.name+"\' to : "+newPath);
      this.api.moveFile(this.selectedFile,newPath).subscribe(
        rep => { /*this.updateFiles();*/ },
        err => { console.log(err); }
      );
      this.movemodal.close();
      /* TODO : Use the checkboxes but display only the possible ones
         (if a file comes only from Dropbox, there is also the Google Drive checkbox... */
    } else {
      console.log("NO SELECTED FILE!");
    }
  }

  /**
   * @Triggered : New folder icon
   * Create an empty folder in the current location
   * Use the name given in the field
   * @Callback : Update file tree
   */
  private addingNewFolder(){
    let enteredName = (<HTMLInputElement>document.getElementById("new-folder")).value;

    if (enteredName == ""){
      enteredName = "Canceled";
      //TODO : Why don't we just stop here with a return?
    }
    //Get the absolute path of the current location
    let path = this.getFileStackString()+enteredName;
    console.log("Adding new empty folder : "+path);

    if((<HTMLInputElement>document.getElementById("googleDriveNewFolder")).checked){
      this.api.newFolder(path,"GoogleDrive").subscribe(
        rep => {/*this.updateFiles();*/},
        err => {console.log(err);
      });
    }
    if((<HTMLInputElement>document.getElementById("dropboxNewFolder")).checked){
      this.api.newFolder(path,"Dropbox").subscribe(
        rep => {},
        err => {console.log(err);
      })

    }
    this.newfoldermodal.close();
  }

  /**
   * @Triggered : Input file change event on upload modal
   * Only update the selected file on the upload popup
   */
  private fileChange(event) {
    this.upload = event.target.files;
  }

  /**
   * @Triggered : Upload button on upload modal
   * Upload the selected file on the upload popup
   * @Callback : Update file tree
   */
  private uploadFile(){
    let fileList: FileList = this.upload;
    if(fileList.length > 0) {
      let file: File = fileList[0]; //Get the first file
      console.log("Uploading : "+file.name);
      
      if((<HTMLInputElement>document.getElementById("googleDriveUpload")).checked){
        this.api.uploadFile(file,"GoogleDrive").subscribe(
          rep => {this.updateFiles();},
          err => {console.log(err);
      });
      }
      if((<HTMLInputElement>document.getElementById("dropboxUpload")).checked){
        this.api.uploadFile(file,"Dropbox").subscribe(
          rep => {this.updateFiles();},
          err => {console.log(err);
      });
      }
    }
    this.uploadmodal.close();
  }

  /** UTILS **/

  /**
   * @Triggered : Component initialization + file updating actions
   * Fetch all the remote files and update the file tree
   */
  private updateFiles(){
    this.rootFolder = new FileDrive("Root",new Array<FileDrive>(),"folder",0, null); //We always start the app from the root
    this.stackFolder = new Array<FileDrive>();
    this.selectedFile = null;
    this.api.getFiles().subscribe(
      //file => { this.rootFolder = file },
      files => { this.addFilesToArray(this.rootFolder,files) },
      err => { console.log(err); }
    );
  }

  /**
   * Return true if the file must be displayed
   */
  private filterFile(file:FileDrive): boolean{
    let src = file.sources;
    let res = false;
    for(let i of file.sources){
      if(i.name === "GoogleDrive"){
        res = (res || this.googleFilter);
      } else if(i.name === "Dropbox"){
        res = (res || this.dropboxFilter);
      }
    }
    return res;
  }

  public formatBytes(a,b){
    if(isNaN(a)){
      return;
    }
    if(0==a){
      return "0 Bytes";
    }
    var c = 1e3,
      d = b || 2,
      extensions = ["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],
      level = Math.floor( Math.log(a) / Math.log(c) );
    return parseFloat( (a / Math.pow(c,level) ).toFixed(d) )+" "+extensions[level]
  }

  public getFileStackString():string{
    var path = "/";
    //Get the absolute path of the current location
    for(var i=1; i< this.stackFolder.length; i++){
      path += this.stackFolder[i].name+"/";
    }
    //Add the name of current folder (not shown in the file stack)
    if(this.rootFolder.name!='Root'){
      path += this.rootFolder.name+"/";
    }
    return path;
  }
}
