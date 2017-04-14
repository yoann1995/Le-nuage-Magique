import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { APIService } from 'app/project/model/api.service';
import { FilePageComponent } from 'app/project/file-page/file-page.component';
import { ConnexionDriveComponent } from 'app/project/connexion-drive/connexion-drive.component';
import { StaticPageComponent } from 'app/project/static-page/static-page.component';
import { MainComponent } from 'app/project/main/main.component';

@NgModule({
  declarations: [
    ConnexionDriveComponent,
    FilePageComponent,
    StaticPageComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [APIService],
  entryComponents: [StaticPageComponent, FilePageComponent],
  bootstrap: [StaticPageComponent]
})
export class AppModule{
}
