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

  constructor(public api: APIService) { }

  ngOnInit() { }

  /*
  * Connection to a particular drive source
  */
  public connect(name) {
    console.log(name)
    if(name==="GoogleDrive"){
      window.open("http://localhost:8080/connect/GoogleDrive", '_self');
      this.api.getAccountInfos().subscribe(
          infos => { this.checkConnection(infos) },
          err => { console.log(err); },
    );
    }
    else if(name==="Dropbox"){
      window.open("http://localhost:8080/connect/Dropbox", '_self');
    }
    else if(name==="OneDrive"){
    }
      this.isConnected=true; //Change when the servers errors are thrown
  }

  public checkConnection(infos){
    let i=0;
    while(infos[i].source !== this.name){
       i++;
    }
    this.ppURL = infos[i].picture;
  }
}
