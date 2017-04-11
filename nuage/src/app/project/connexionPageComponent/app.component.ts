import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  enterInApp(){
    document.getElementById("connexion").remove();
    document.getElementById("drivePage").style.display = 'block';
  }

}
