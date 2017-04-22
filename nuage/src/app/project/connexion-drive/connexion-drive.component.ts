import { Component, OnInit, Input } from '@angular/core';
import {APIService} from '../model/api.service'

@Component({
  selector: 'app-connexion-drive',
  templateUrl: './connexion-drive.component.html',
  styleUrls: ['./connexion-drive.component.css']
})
export class ConnexionDriveComponent implements OnInit {

  @Input() name : string;
  /**
   * Represent weither the user is connected on this source or not
   * Indicates what to display on the HTML
   */
  public isConnected = false;
  public ppURL;
  public userName;

  constructor(public api: APIService) { }

  ngOnInit() {
    this.api.getAccountInfos().subscribe(
      infos => { this.checkConnection(infos) },
      err => { console.log(err); },
    );
  }

  /*
  * Connection to a particular drive source
  */
  public connect() {
    if(this.name==="GoogleDrive"){
      window.open("http://localhost:8080/connect/GoogleDrive", '_self');
    }
    else if(this.name==="Dropbox"){
      window.open("http://localhost:8080/connect/Dropbox", '_self');
    }
    else if(this.name==="OneDrive"){
    }
       //Change when the servers errors are thrown
  }

  public checkConnection(infos){
    /*
    let i=0;
    while(infos[i].source !== this.name){
       i++;
    }
    this.ppURL = infos[i].picture;
    */
    console.log(infos);
    for (var i = 0; i < infos.length; i++) {
      let obj = infos[i];
      if(obj.source === this.name){
        this.isConnected=true;
        this.ppURL = obj.picture;
        this.userName = obj.name;
      }
    }
  }

  public accountInfos(){
    this.api.getAccountInfos().subscribe(
      infos => { this.checkConnection(infos) },
      err => { console.log(err); },
    );
  }
}
