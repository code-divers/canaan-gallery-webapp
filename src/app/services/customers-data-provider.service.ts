import { Injectable } from '@angular/core';
import { ICustomer } from '../orders/order-interface';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as Fuse from 'fuse.js';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const MAX_SEARCH_RESULTS = 20;

@Injectable({
  providedIn: 'root'
})
export class CustomersDataProviderService {
  private fuse = null;
  loadingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly afs: AngularFirestore) {
      if (!this.fuse) {
        this.fetchCustomers().subscribe(() => {
          return true;
        });
      }
  }

  fetchCustomers() {
    this.loadingStatus.next(true);
    return this.afs.collection<ICustomer>('customers').snapshotChanges().pipe(map(response => {
      const customers = response.map(body => {
        const newItem = body.payload.doc.data();
        newItem.id = body.payload.doc.id;
        return newItem;
      });
      this.fuse = new Fuse(customers, {
        keys: ['id', 'name']
      });
      this.loadingStatus.next(false);
      return customers;
    }));
  }

  search(query) {
    const results = this.fuse.search(query);
    const count = results.length > MAX_SEARCH_RESULTS ? MAX_SEARCH_RESULTS : results.length;
    return results.slice(0, count);
  }
}
