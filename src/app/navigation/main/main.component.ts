import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'mapa-navigation-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild('drawer') drawer;
	user;

  constructor(private auth: AuthenticationService) { 
  	auth.user.subscribe((user)=>{
  		this.user = user;
  	});
  }

  ngOnInit() {
  	//this.user = this.auth.getAuthenticatedUserDetails();
  	//console.log(this.user);
  }

  logout(){
    this.auth.logout();
    this.drawer.close()
  }

}
