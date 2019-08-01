import { Injectable } from '@angular/core';
import { IOrder } from '../orders/order-interface';
import { AngularFirestore } from '@angular/fire/firestore';
import * as Fuse from 'fuse.js';
import { BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';

const MAX_SEARCH_RESULTS = 100;

@Injectable({
  providedIn: 'root'
})
export class OrdersDataProviderService {
  private fuse = null;

  loadingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly afs: AngularFirestore) {
  }

  fetchOrders(query?) {
    this.loadingStatus.next(true);
    return this.afs.collection<IOrder>('orders', ref => {
      ref.orderBy('created', 'desc');
      return ref;
    }).snapshotChanges().pipe(map(response => {
      let ids = [];
      if (query) {
        ids = this.search(query);
      }
      const newlist = response.map(item => {
        if (ids.length > 0 && ids.indexOf(item.payload.doc.id) === -1) {
            return null;
        }
        const newItem = item.payload.doc.data();
        newItem.id = item.payload.doc.id;
        const customerAddress = newItem['customerAddress'] = [];
        if (newItem.customer.address) {
          customerAddress.push(newItem.customer.address);
        }
        if (newItem.customer.city) {
          customerAddress.push(newItem.customer.city);
        }
        if (newItem.customer.country) {
          customerAddress.push(newItem.customer.country);
        }
        return newItem;
      }).filter(item => item != null).sort( (a: IOrder, b: IOrder) => {
        return b.created.toDate() - a.created.toDate();
      });

      let list = newlist;
      if (ids.length > 0) {
        list = ids.map((id) => newlist.find(order => order.id === id));
      } else {
        this.applyFuse(list);
      }
      this.loadingStatus.next(false);
      return list;
    }));
  }

  applyFuse(list) {
    this.fuse = new Fuse(list, {
      keys: ['comaxDocNumber', 'customer.name'],
      id: 'id'
    });
  }

  search(query) {
    const results = this.fuse.search(query);
    const count = results.length > MAX_SEARCH_RESULTS ? MAX_SEARCH_RESULTS : results.length;
    return results.slice(0, count);
  }
}