import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyApiService {

  constructor(private readonly afs: AngularFirestore) { }

  fetchCurrencies() {
    return this.afs.collection<ICurrency>('currencies').snapshotChanges().pipe(map((response) => {
      const list = response.map(body => {
        const newItem = body.payload.doc.data();
        newItem.id = body.payload.doc.id;
        return newItem;
      });
      list.push({
        id: 'ILS',
        change: 0,
        country: 'Israel',
        lastUpdate: new Date(),
        name: 'Israeli new shekel',
        rate: 1,
        unit: 1
      });
      return list;
    }));
  }

  fetchMainCurrencies(){
    return this.fetchCurrencies().pipe(map(currencies=>{
      return currencies.filter(currency=>{
        return currency.id === 'USD' || currency.id === 'ILS'
      });
    }))
  }
}

export interface ICurrency {
  id: string;
  name: string;
  lastUpdate: Date;
  unit: number;
  country: string;
  rate: number;
  change: number;
}
