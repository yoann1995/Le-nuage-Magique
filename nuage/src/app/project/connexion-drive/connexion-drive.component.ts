import { Component, OnInit, Input } from '@angular/core';
import {APIService} from '../model/api.service'

@Component({
  selector: 'app-connexion-drive',
  templateUrl: './connexion-drive.component.html',
  styleUrls: ['./connexion-drive.component.css']
})
/* 
 * Represent a connection component to a certain cloud service
 * Displayed on the home page
 */
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
    this.accountInfos();
  }

  /*
  * Connection to a particular drive source
  */
  public connect() {
      window.open("http://localhost:8080/connect/"+this.name, '_self');
       //Change when the servers errors are thrown
  }

  public checkConnection(infos){
    console.log(infos);
    for (var i = 0; i < infos.length; i++) {
      let obj = infos[i];
      if(obj.source === this.name){
        this.isConnected = true;
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

  public disconnect(){
    window.open("http://localhost:8080/disconnect/"+this.name, '_self');
  }
}
