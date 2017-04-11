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

  connect() {
  	console.log("Trying to get files")
  	this.nuage.getFiles().subscribe(
  		(response) => {
    		console.log("Displaying files");
  			console.log(response[0].files[0].id);
		});
  }
}
