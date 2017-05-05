import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FilePageComponent } from '../file-page/file-page.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
/**
 * A simple component displaying the connection component on the home page
 */
export class MainComponent implements OnInit {

 @ViewChild('parent', {read: ViewContainerRef})
  parent: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver){
  }

  ngOnInit() { }

  /*
  * Swtich between the connection page and the page with all files.
  */
  enterInApp(){
    window.location.href = "http://localhost:4200/files";
  }

}
