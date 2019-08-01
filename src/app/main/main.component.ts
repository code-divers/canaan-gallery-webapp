import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { filter, map, switchMap } from 'rxjs/operators';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'navigation-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild('drawer') drawer;
  user;
  title;

  constructor(private auth: AuthenticationService, private router: Router, private activatedRoute: ActivatedRoute) { 
    auth.user.subscribe((user) => {
  		this.user = user;
    });
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .pipe(map(() => this.activatedRoute))
    .pipe(map(route => route.firstChild))
    .pipe(switchMap(route=>route.data))
    .subscribe((route) => {
      this.title = 'Canaan Gallery - ' + route['title'];
    });
    this.title = 'Canaan Gallery';
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
