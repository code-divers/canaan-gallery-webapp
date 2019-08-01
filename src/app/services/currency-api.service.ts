import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyApiService {
  currencyArray: ICurrency[];
  private currencyCollection: AngularFirestoreCollection<ICurrency>;
  currencies: Observable<ICurrency[]>;
  filteredCurrencies: Observable<ICurrency[]>;

  constructor(private readonly afs: AngularFirestore) {
    this.currencyCollection = afs.collection<ICurrency>('currencies');
    this.currencies = this.currencyCollection.valueChanges().pipe(map((list) => {
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

    this.currencies.subscribe(value => {
      this.currencyArray = value;
    });

    this.filteredCurrencies = this.currencies.pipe(map(list => {
      return list.filter(value => {
        return value.id === 'ILS' || value.id === 'USD';
      });
    }));
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
