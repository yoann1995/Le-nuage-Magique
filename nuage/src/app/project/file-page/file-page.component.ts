import { Component, OnInit, ViewChild } from '@angular/core';
import { FileDrive } from '../model/FileDrive';
import { Http, Response, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { APIService } from '../model/api.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-file-page',
  templateUrl: './file-page.component.html',
  styleUrls: ['./file-page.component.css'],
})
export class FilePageComponent implements OnInit {

  @ViewChild('renamemodal')
  modal: ModalComponent;
  public rootFolder : FileDrive; //The folder containing the first files (at the root)
  public stackFolder : Array<FileDrive>; //The stack trace of file tree
  public selectedFile : FileDrive; //The current selected file
  private previousSelectedFileRowColor:string; //The color of the row of the previous selected file to retrieve it
  private googleFilter:boolean = true; //True when we want it to be displayed
  private dropboxFilter:boolean = true;
  private onedriveFilter:boolean = true;

  constructor(public api: APIService, private http: Http)  {
    this.rootFolder = new FileDrive("Root",new Array<FileDrive>(),"folder",0, null); //We always start the app from the root
    this.stackFolder = new Array<FileDrive>();
  }

  ngOnInit() {
    this.api.getFiles().subscribe(
      files => { this.addFilesToArray(this.rootFolder, files); },
      err => { console.log(err); },
    );
  }

  /*
  * Build the file tree
  */
  addFilesToArray(parent:FileDrive, files){
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

  public renameFile(){
    if(this.selectedFile){
      let newFileName = (<HTMLInputElement>document.getElementById('new-file-name')).value;
      console.log("Renaming \'"+this.selectedFile.name+"\' by : "+newFileName);
      this.api.rename(this.selectedFile,newFileName).subscribe(
        rep => { this.selectedFile.name = newFileName; },
        err => { console.log(err); }
      );
      //TODO : quit modal
      this.modal.close();
    } else {
      console.log("NO SELECTED FILE!");
    }
  }

  /*
  * Select a file by clicking on it
  * @param the file to select
  */
  public selectFile(selected:FileDrive){
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
  * Go inside a folder selected, get all its childrens, started by double clicking the file
  * @param file The file to go in
  */
  public goInSelectedFolder(file:FileDrive){
    //If the file has childrens
    if(file.type == "folder"){
      let backButton = document.getElementById('buttonReturn');
      backButton.className = 'btn';
      this.stackFolder.push(this.rootFolder); //Adding to stack path the previous root folder
      this.rootFolder = file;
      this.selectedFile = null; //There is no selected file anymore
    }
  }

  /*
  * Return to the parent folder (above in the tree)
  */
  public goBack(){
    this.rootFolder = this.stackFolder.pop(); //Going back on the stack
    if(this.rootFolder.name=="Root"){
      let backButton = document.getElementById('buttonReturn');
      backButton.className = 'btn disabled';
    }
  }

  /*
   * Remove the current selected file
   */
  public deleteSelectedFile(){
    this.deleteFile(this.selectedFile);
    this.selectedFile = null;
  }

  /**
   * Go back to home page
   */
  public returnToSettings(){
    window.location.href = "http://localhost:4200/home";
  }

  /*
   * Remove a file in the current folder
   */
  private deleteFile(fileToRemove:FileDrive){
    if(fileToRemove){
      let removeRet = this.rootFolder.removeChild(fileToRemove);
      this.api.removeFile(fileToRemove);
      if(!removeRet) alert ("Removing "+fileToRemove.name+" file failed");
    }
  }

  private showPopUp(name){
    console.log(name);
    if(name=="File"){
      document.getElementById("lightFile").style.display='block';
    }else if(name=="Folder"){
      document.getElementById("lightFolder").style.display='block';
    }
    document.getElementById("fade").style.display='block';
  }

  private disablePopUp(name){
    if(name=="File"){
      document.getElementById("lightFile").style.display='none';
    }else if(name=="Folder"){
      document.getElementById("lightFolder").style.display='none';
    }
    document.getElementById("fade").style.display='none';
  }

  public addingNewFolder(){
    this.disablePopUp("Folder");
    let ret = (<HTMLInputElement>document.getElementById("textAreaNewFolder")).value;

    if (ret==""){
      ret = "Canceled";
    }
    var path = "/";
    for(var i=1; i< this.stackFolder.length; i++){
      path+=this.stackFolder[i].name+"/";
    }
    if(this.rootFolder.name!='Root'){
      console.log(this.rootFolder.name);
      path+=this.rootFolder.name+"/";
    }
    path+=ret
    console.log("Adding new folder : "+path);
    if((<HTMLInputElement>document.getElementById("googleDriveFolder")).checked){
      this.api.newFolder(path,"GoogleDrive")
    }
    if((<HTMLInputElement>document.getElementById("dropboxFolder")).checked){
      this.api.newFolder(path,"Dropbox")
    }
  }

  /**
   * Return true if the file must be displayed
   */
  public filterFile(file:FileDrive): boolean{
    let src = file.sources;
    let res = false;
    for(let i of file.sources){
      if(i.name === "GoogleDrive"){
        res = (res || this.googleFilter);
      } else if(i.name === "Dropbox"){
        res = (res || this.dropboxFilter);
      } else if(i.name === "OneDrive"){
        res = (res || this.onedriveFilter);
      }
    }
    return res;
  }

  public fileChange(event) {
    this.disablePopUp("File");

    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
        let file: File = fileList[0];
        let formData:FormData = new FormData();
        formData.append('uploadFile', file, file.name);
        let headers = new Headers();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        let options = new RequestOptions(headers);

        if((<HTMLInputElement>document.getElementById("googleDriveFile")).checked){
          this.http.post(`http://localhost:8080/upload/GoogleDrive`, formData, options)
              .map(res => res.json())
              .catch(error => Observable.throw(error))
              .subscribe(
                  data => console.log('success'),
                  error => console.log(error)
              )
        }
        if((<HTMLInputElement>document.getElementById("dropboxFile")).checked){
          this.http.post(`http://localhost:8080/upload/Dropbox`, formData, options)
              .map(res => res.json())
              .catch(error => Observable.throw(error))
              .subscribe(
                  data => console.log('success'),
                  error => console.log(error)
              )
        }

    }
  }

  formatBytes(a,b){if(isNaN(a)) return; if(0==a)return"0 Bytes";var c=1e3,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}
}
