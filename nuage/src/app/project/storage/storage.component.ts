import { Component, OnInit } from '@angular/core';
import { FileDrive } from '../model/FileDrive';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { APIService } from '../model/api.service'

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
/**
 * A storage component displaying the storage information for a specific cloud service
 */
export class StorageComponent implements OnInit {

	public storage:any;

  constructor(public api: APIService) { }

  ngOnInit() {
  	this.api.getSpaceUsage().subscribe(
      files => { this.storage = files; },

      err => { console.log(err); },
    );
  }

  public percent(a,b){
  	return Math.max(Math.round((a/b)*100),1);
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

}
