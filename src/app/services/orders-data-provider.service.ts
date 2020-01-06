import { Injectable } from '@angular/core';
import { IOrder } from '../order-interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import * as Fuse from 'fuse.js';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const MAX_SEARCH_RESULTS = 100;

@Injectable({
  providedIn: 'root'
})
export class OrdersDataProviderService {
  private fuse = null;

  loadingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly afs: AngularFirestore,
    private fns: AngularFireFunctions) {
  }

  cacheFuze() {
    const ordersObserver = this.fetchOrders();
    ordersObserver.subscribe((list) => {
      this.applyFuse(list);
    });
    return ordersObserver;
  }

  fetchOrders(query?) {
    this.loadingStatus.next(true);
    return this.afs.collection<IOrder>('orders', ref => {
      ref.orderBy('created', 'desc');
      return ref;
    }).snapshotChanges().pipe(map(response => {
      const list = response.map(body => {
        const newItem = body.payload.doc.data();
        newItem.id = body.payload.doc.id;
        return newItem;
      });
      list.sort( (a: IOrder, b: IOrder) => {
        return b.created.toDate() - a.created.toDate();
      });
      this.applyFuse(list);
      this.loadingStatus.next(false);
      return list;
    }));
  }

  applyFuse(list) {
    this.fuse = new Fuse(list, {
      keys: ['comaxDocNumber', 'customer.name']
    });
  }

  search(query) {
    const results = this.fuse.search(query);
    const count = results.length > MAX_SEARCH_RESULTS ? MAX_SEARCH_RESULTS : results.length;
    return results.slice(0, count);
  }

  setRecipt(order: IOrder) {
    const callable = this.fns.httpsCallable('setOrderReceipt');
    return callable(order);
  }
}
