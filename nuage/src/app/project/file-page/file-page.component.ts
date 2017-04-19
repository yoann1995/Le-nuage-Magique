import { Component, OnInit } from '@angular/core';
import {FileDrive} from '../model/FileDrive';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {APIService} from '../model/api.service'

@Component({
  selector: 'app-file-page',
  templateUrl: './file-page.component.html',
  styleUrls: ['./file-page.component.css']
})
export class FilePageComponent implements OnInit {

  //public selectedFolder : string;
  public rootFolder : FileDrive;
  public stackFolder : Array<FileDrive>;
  public selectedFile : FileDrive;
  private previousSelectedFileRowColor:string;

  constructor(public api: APIService)  {
    this.rootFolder = new FileDrive("1","Root",new Array<FileDrive>(),"folder",0); //We always start the app from the root
    this.stackFolder = new Array<FileDrive>();
  }

  ngOnInit() {
    this.api.getFiles().subscribe(
      files => { this.addFilesToArray(this.rootFolder, files) },
      err => { console.log(err); },
    );
  }

  /*
  * Build the file tree
  */
  addFilesToArray(parent:FileDrive, files){
    //The generated json has 2 embebed arrays, [0] is Google Drive and [1] is Dropbox files
    for(let file of files){
      //Create all the childrens from the json Documents
      var fd = new FileDrive(file.id, file.name,new Array<FileDrive>(), file.type, file.size);
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
    console.log("ID:"+selected.id+" - Name:"+selected.name);
    //Restore the normal color of the previous selected file's row
    if(this.selectedFile){ //Check if there is a selected row already
      let previousSelected = document.getElementById(this.selectedFile.id);
      previousSelected.style.backgroundColor = this.previousSelectedFileRowColor;
      previousSelected.style.color = "#000000";
    }

    //Color the new selected file's row
    let myFile = document.getElementById(selected.id);
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
  * Go inside a folder selected, get all its childrens, started by double clicking the file
  * @param file The file to go in
  */
  public deleteSelectedFile(){
    this.deleteFile(this.selectedFile);
    this.selectedFile = null;
  }

  /*
  * Go inside a folder selected, get all its childrens, started by double clicking the file
  * @param file The file to go in
  */
  private deleteFile(fileToRemove:FileDrive){
    if(fileToRemove){
      console.log("Deleting file "+fileToRemove.name);
      let removeRet = this.rootFolder.removeChild(fileToRemove);
      if(!removeRet) alert ("Removing "+fileToRemove.name+" file failed");
    }
  }


}