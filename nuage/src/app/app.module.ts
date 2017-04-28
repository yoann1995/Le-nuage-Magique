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
import { PagenotfoundComponent } from 'app/project/pagenotfound/pagenotfound.component';
import { StorageComponent } from './project/storage/storage.component';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

const appRoutes: Routes = [
  { path: 'home', component: MainComponent },
  { path: 'files', component: FilePageComponent },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  { path: '**', component: PagenotfoundComponent }
];


@NgModule({
  declarations: [
    ConnexionDriveComponent,
    FilePageComponent,
    StaticPageComponent,
    MainComponent,
    PagenotfoundComponent,
    StorageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    Ng2Bs3ModalModule
  ],
  providers: [APIService],
  entryComponents: [StaticPageComponent, FilePageComponent],
  bootstrap: [StaticPageComponent]
})
export class AppModule{
}
