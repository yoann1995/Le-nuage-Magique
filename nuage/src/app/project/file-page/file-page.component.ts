import { Component, OnInit } from '@angular/core';
import { FileDrive } from '../model/FileDrive';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { APIService } from '../model/api.service'

@Component({
  selector: 'app-file-page',
  templateUrl: './file-page.component.html',
  styleUrls: ['./file-page.component.css']
})
export class FilePageComponent implements OnInit {

  public rootFolder : FileDrive; //The folder containing the first files (at the root)
  public stackFolder : Array<FileDrive>; //The stack trace of file tree
  public selectedFile : FileDrive; //The current selected file
  private previousSelectedFileRowColor:string; //The color of the row of the previous selected file to retrieve it
  private googleFilter:boolean = true; //True when we want it to be displayed
  private dropboxFilter:boolean = true;
  private onedriveFilter:boolean = true;

  constructor(public api: APIService)  {
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
    if(file.childrens.length!=0){
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

  /**
   * Linked to the + button
   * Add an empty folder to the current root folder
   */
  private newFolder(){
    //Popup window with a field
    let name = prompt("Nouveau fichier","");
    let ret;
    if (name==null){
      ret = "Canceled";
    } else {
      ret = name;
    }
    console.log("Adding new folder : "+ret);
    let folder:FileDrive = new FileDrive(name,new Array<FileDrive>(),"folder",0, [{"name":"GoogleDrive","id":"001"}]);
    this.rootFolder.childrens.push(folder);
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
}
