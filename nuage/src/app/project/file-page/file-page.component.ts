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
  * Go inside a folder selected, get all its childrens
  * @param file The file to go in
  */
  goInSelectedFolder(file){
    console.log("Stack before go size:"+this.stackFolder.length);
    //If the file has childrens
    if(file.childrens.length!=0){
      let backButton = document.getElementById('buttonReturn');
      backButton.className = 'btn';
      this.stackFolder.push(this.rootFolder); //Adding to stack path the previous root folder
      this.rootFolder = file;
    }
    console.log("Stack after go size:"+this.stackFolder.length);
  }

  /*
  * Return to the parent folder (above in the tree)
  */
  goBack(){
    console.log("Stack before back size:"+this.stackFolder.length);
    this.rootFolder = this.stackFolder.pop(); //Going back on the stack
    if(this.rootFolder.name=="Root"){
      let backButton = document.getElementById('buttonReturn');
      backButton.className = 'btn disabled';
    } 
    console.log("Stack after back size:"+this.stackFolder.length);
  }
}