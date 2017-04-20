import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-connexion-drive',
  templateUrl: './connexion-drive.component.html',
  styleUrls: ['./connexion-drive.component.css']
})
export class ConnexionDriveComponent implements OnInit {

  @Input() name : string;

  constructor() { }

  ngOnInit() { }

  /*
  * Connection to a particular drive
  */
  connect(name) {
    console.log(name)

  	console.log("Trying to get files")
    if(name==="GoogleDrive"){
      window.open("http://localhost:8080/connect/GoogleDrive", '_self');
      this.addValidateImg("connectionButtonGoogleDrive","validateGoogleDrive");
    }
    else if(name==="Dropbox"){
      window.open("http://localhost:8080/connect/Dropbox", '_self');
      this.addValidateImg("connectionButtonDropbox","validateDropbox");
    }
    else if(name==="OneDrive"){
      this.addValidateImg("connectionButtonOneDrive","validateOneDrive");
    }
  }

  /*
  *Display vaidate image when connection to the drive is okay
  */
  addValidateImg(idButton, idImg){
    //TODO : Display profile pic + name of the connected account
    document.getElementById(idButton).style.display="none";
    document.getElementById(idImg).style.display="block";
  }
}
