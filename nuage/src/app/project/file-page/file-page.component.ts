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

  public listFile : Array<FileDrive>;
  public selectedFolder : string;

  constructor(private http: Http)  {
    this.listFile = new Array<FileDrive>();
  }

  ngOnInit() {
    this.getFiles().subscribe(
          files => this.addFilesToArray(files), //Bind to view
          err => {
              // Log errors if any
              console.log(err);
          });
  }

  getFiles(): Observable<FileDrive[]>{
    return this.http.get('src/app/project/file-page/exempleFilesList.json')
                    .map((res:Response) => res.json());
  }

  addFilesToArray(files){
    for(let file of files.files){
      var parent = null;
      if(file.parents !== null)
        parent = file.parents;
      var fi = new FileDrive(file.id, parent, file.name, file.mimeType);
      this.listFile.push(fi);
    }
  }

  putInSelectedFolder(file){
    this.selectedFolder = file.id;
  }

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
      console.log(file.parent);
      console.log(this.selectedFolder);
      console.log("===============");
      if(file.parent==this.selectedFolder){
        return true;
      }
      else{
        return false;
      }
    }
  }


}
