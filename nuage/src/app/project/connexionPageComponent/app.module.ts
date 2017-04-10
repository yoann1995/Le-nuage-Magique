import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ConnexionComponentDriveComponent } from '../connexion-component-drive/connexion-component-drive.component';

@NgModule({
  declarations: [
    AppComponent,
    ConnexionComponentDriveComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule{

  validate(){
    console.log("ojiohi");
  }

}
