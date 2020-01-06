import { Injectable } from '@angular/core';
import { ICustomer } from '../order-interface';
import { AngularFirestore } from '@angular/fire/firestore';
import * as Fuse from 'fuse.js';
import { BehaviorSubject, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

const MAX_SEARCH_RESULTS = 20;

@Injectable({
  providedIn: 'root'
})
export class CustomersDataProviderService {
  private fuse = null;
  loadingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly afs: AngularFirestore) {
  }

  cacheFuze() {
    this.fetchCustomers().subscribe((list) => {
      this.applyFuse(list);
    });
  }

  fetchCustomers() {
    this.loadingStatus.next(true);
    const coll = this.afs.collection<ICustomer>('customers').snapshotChanges().pipe(map(response => {
      const list = response.map(body => {
        const newItem = body.payload.doc.data();
        newItem.id = body.payload.doc.id;
        return newItem;
      });
      list.sort( (a: ICustomer, b: ICustomer) => {
        return b.lastUpdate.toDate() - a.lastUpdate.toDate();
      });
      this.loadingStatus.next(false);
      return list;
    }));
    coll.pipe(take(1)).subscribe((list) => {
      this.applyFuse(list);
    });
    return coll;
  }

  applyFuse(list) {
    this.fuse = new Fuse(list, {
      keys: ['id', 'name', 'email']
    });
  }

  search(query) {
    const results = this.fuse.search(query);
    const count = results.length > MAX_SEARCH_RESULTS ? MAX_SEARCH_RESULTS : results.length;
    return of(results.slice(0, count));
  }
}
