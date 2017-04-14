import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FilePageComponent } from '../file-page/file-page.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
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
    //document.getElementById("connexion").remove();
    //const childComponent = this.componentFactoryResolver.resolveComponentFactory(FilePageComponent);
    //this.parent.createComponent(childComponent);
    window.location.href = "http://localhost:4200/files";
  }

}
