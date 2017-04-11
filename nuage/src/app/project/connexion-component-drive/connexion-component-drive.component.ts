import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-connexion-component-drive',
  templateUrl: './connexion-component-drive.component.html',
  styleUrls: ['./connexion-component-drive.component.css']
})
export class ConnexionComponentDriveComponent implements OnInit {

  @Input() name : string;

  constructor() { }

  ngOnInit() {
  }

  connect() {
  	//TODO
  	
    console.log("Connexion en cours");
  }

}
