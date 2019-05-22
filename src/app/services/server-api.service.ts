import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerApiService {

  constructor() { }

  getQuestions(lang, query) {
    return null;
  }

  getQuestionArticles(query){
    return null;
  }
}
