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
export class StorageComponent implements OnInit {

	public storage:any;

  constructor(public api: APIService) { }

  ngOnInit() {
  	this.api.getSpaceUsage().subscribe(
      files => { this.storage = files; },

      err => { console.log(err); },
    );
  }

  percent(a,b){
  	return Math.max(Math.round((a/b)),1); //GROS DEGUEU
  }

  formatBytes(a,b){if(0==a)return"0 Bytes";var c=1e3,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

}
