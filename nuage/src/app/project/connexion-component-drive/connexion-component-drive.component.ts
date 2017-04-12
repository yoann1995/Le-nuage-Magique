import { Component, OnInit, Input } from '@angular/core';
import { APIService } from '../model/api.service';

@Component({
  selector: 'app-connexion-component-drive',
  templateUrl: './connexion-component-drive.component.html',
  styleUrls: ['./connexion-component-drive.component.css']
})
export class ConnexionComponentDriveComponent implements OnInit {

  @Input() name : string;

  constructor(private nuage : APIService) { }

  ngOnInit() { }

  connect(name) {
    console.log(name)

  	console.log("Trying to get files")
  	// this.nuage.getFiles().subscribe(
  	// 	(response) => {
    // 		console.log("Displaying files");
  	// 		console.log(response[0].files[0].id);
		// });
    if(name==="GoogleDrive"){
      this.addValidateImg("connectionButtonGoogleDrive","validateGoogleDrive");
    }
    else if(name==="Dropbox"){
      this.addValidateImg("connectionButtonDropbox","validateDropbox");
    }
    else if(name==="OneDrive"){
      this.addValidateImg("connectionButtonOneDrive","validateOneDrive");
    }
  }

  addValidateImg(idButton, idImg){
    document.getElementById(idButton).style.display="none";
    document.getElementById(idImg).style.display="block";
  }
}
