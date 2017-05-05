import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.css']
})
/**
 * The static header and footer of the app
 */
export class StaticPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public reload(){
  	 window.location.href = 'http://localhost:4200/home';
  }

}
