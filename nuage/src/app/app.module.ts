import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { APIService } from 'app/project/model/api.service';
import { FilePageComponent } from 'app/project/file-page/file-page.component';
import { ConnexionDriveComponent } from 'app/project/connexion-drive/connexion-drive.component';
import { StaticPageComponent } from 'app/project/static-page/static-page.component';
import { MainComponent } from 'app/project/main/main.component';
import { RouterModule, Routes } from '@angular/router';


const appRoutes: Routes = [
  { path: 'home', component: MainComponent },
  { path: 'files', component: FilePageComponent },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
  //{ path: '**', component: PageNotFoundComponent }
];


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
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [APIService],
  entryComponents: [StaticPageComponent, FilePageComponent],
  bootstrap: [StaticPageComponent]
})
export class AppModule{
}
