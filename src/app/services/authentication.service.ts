import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationService {
	public user: Observable<firebase.User>;
	public userDetails: firebase.User = null;
	
	constructor(
		private _firebaseAuth: AngularFireAuth, 
		private router: Router) {
      this.user = _firebaseAuth.authState;
      this.user.subscribe(
        (user) => {
          if (user) {
			this.userDetails = user;
          } else {
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

			let callback = null;
			let metadataRef = null;
			this._firebaseAuth.auth.onAuthStateChanged(user => {
				// Remove previous listener.
				if (callback) {
					metadataRef.off('value', callback);
				}
				// On user login add new listener.
				if (user) {
					// Check if refresh is required.
					metadataRef = firebase.database().ref('metadata/' + user.uid + '/refreshTime');
					callback = (snapshot) => {
						// Force refresh to pick up the latest custom claims changes.
						// Note this is always triggered on first call. Further optimization could be
						// added to avoid the initial trigger when the token is issued and already contains
						// the latest claims.
						user.getIdToken(true);
					};
					// Subscribe new listener to changes on that node.
					metadataRef.on('value', callback);
				}
			});
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
		this._firebaseAuth.auth.signOut().then((res) => this.router.navigate(['/login']));
	}
}
