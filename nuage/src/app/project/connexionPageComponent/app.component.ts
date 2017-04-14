import { Component, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FilePageComponent } from '../file-page/file-page.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('parent', {read: ViewContainerRef})
  parent: ViewContainerRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver){

  }

  /*
  * Swtich between the connexion page and the page with all files.
  */
  enterInApp(){
    document.getElementById("connexion").remove();
    const childComponent = this.componentFactoryResolver.resolveComponentFactory(FilePageComponent);
    this.parent.createComponent(childComponent);
  }

}
