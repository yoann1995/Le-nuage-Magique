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
      var fi = new FileDrive(file.name, file.mimeType);
      this.listFile.push(fi);
    }
  }


}
