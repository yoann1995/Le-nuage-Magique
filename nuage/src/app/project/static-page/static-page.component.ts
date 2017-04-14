import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'app/project/connexionPageComponent/app.component';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.css']
})
export class StaticPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public reload(){
  	location.reload();
  }

}
