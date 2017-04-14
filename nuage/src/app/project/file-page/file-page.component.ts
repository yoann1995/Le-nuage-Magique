import { Component, OnInit } from '@angular/core';
import {FileDrive} from './FileDrive';
import { Http, Response }          from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-file-page',
  templateUrl: './file-page.component.html',
  styleUrls: ['./file-page.component.css']
})
export class FilePageComponent implements OnInit {

  //List of all file
  public listFile : Array<FileDrive>;
  //Id of the selected folder
  public selectedFolder : string;
  //Array with all previous ids
  public previousIds : Array<string>;

  constructor(private http: Http)  {
    this.listFile = new Array<FileDrive>();
    this.previousIds = new Array<string>();
  }

  ngOnInit() {
    this.getFiles().subscribe(
          files => this.addFilesToArray(files), //Bind to view
          err => {
              // Log errors if any
              console.log(err);
          });
  }

  /*
  * Get json file
  */
  getFiles(): Observable<FileDrive[]>{
    return this.http.get('src/app/project/file-page/jsonDrive.json')
                    .map((res:Response) => res.json());
  }


  /*
  *Add each file to the array of files
  */
  addFilesToArray(files){
    for(let file of files.items){
      var parent = null;
      if(file.parents !== null){
        parent = file.parents;
      }

      var fi = new FileDrive(file.id, parent, file.title, file.mimeType);
      this.listFile.push(fi);
    }
  }

  /*
  * Go inside a folder selected
  */
  goInSelectedFolder(file){
    this.previousIds.push(this.selectedFolder);
    this.selectedFolder = file.id;
  }

  /*
  * Return to the branch above
  */
  goBack(){
    this.selectedFolder = this.previousIds[this.previousIds.length-1];
    this.previousIds.pop();
  }

  /*
  * Condition to know if a file can be display
  */
  canBeDisplay(file){
    if(this.selectedFolder==null){
      if(file.parent==null){
        return true;
      }
      else{
        return false;
      }
    }
    else{
      if(file.parent==this.selectedFolder){
        return true;
      }
      else{
        return false;
      }
    }
  }


}
