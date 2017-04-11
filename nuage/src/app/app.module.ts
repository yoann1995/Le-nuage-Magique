import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { APIService } from 'app/project/model/api.service';

<<<<<<< HEAD:nuage/src/app/app.module.ts
import { AppComponent } from './project/connexionPageComponent/app.component';
import { ConnexionComponentDriveComponent } from './project/connexion-component-drive/connexion-component-drive.component';
import { FilePageComponent } from './project/file-page/file-page.component';
=======
import { AppComponent } from 'app/project/connexionPageComponent/app.component';
import { ConnexionComponentDriveComponent } from 'app/project/connexion-component-drive/connexion-component-drive.component';
>>>>>>> bf525fe075f0b00c2ff1eb98df536da22fa1bac7:nuage/src/app/app.module.ts

@NgModule({
  declarations: [
    AppComponent,
    ConnexionComponentDriveComponent,
    FilePageComponent
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
