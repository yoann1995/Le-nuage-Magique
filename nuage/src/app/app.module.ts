import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { APIService } from 'app/project/model/api.service';

import { AppComponent } from 'app/project/connexionPageComponent/app.component';
import { ConnexionComponentDriveComponent } from 'app/project/connexion-component-drive/connexion-component-drive.component';

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
  providers: [APIService],
  bootstrap: [AppComponent]
})
export class AppModule{

}
