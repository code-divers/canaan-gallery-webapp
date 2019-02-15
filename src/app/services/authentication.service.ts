import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationService {
	public user: Observable<firebase.User>;
	public userDetails: firebase.User = null;
	
	constructor(private _firebaseAuth: AngularFireAuth, private router: Router) { 
      this.user = _firebaseAuth.authState;
      this.user.subscribe(
        (user) => {
          if (user) {
            this.userDetails = user;
            console.log(this.userDetails);
          }
          else {
            this.userDetails = null;
          }
        }
      );
  	}

	doGoogleLogin(){
		return new Promise<any>((resolve, reject) => {
			let provider = new firebase.auth.GoogleAuthProvider();
			provider.addScope('profile');
			provider.addScope('email');
			this._firebaseAuth.auth.signInWithPopup(provider).then(res => {
				resolve(res);
			})
		})
	}

	getAuthenticatedUserDetails(){
		return this.userDetails;
	}

	isLoggedIn() {
		if (this.userDetails == null ) {
		  return false;
		} else {
		  return true;
		}
	}
	
	logout() {
		this._firebaseAuth.auth.signOut().then((res) => this.router.navigate(['/']));
	}
}
