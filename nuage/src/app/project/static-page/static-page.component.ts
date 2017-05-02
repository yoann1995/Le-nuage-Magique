import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.css']
})
export class StaticPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public static reload(){
  	 window.location.href = 'http://localhost:4200/home';
  }

}
