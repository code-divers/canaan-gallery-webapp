import { Injectable } from '@angular/core';
import { IProduct } from '../order-interface';
import { AngularFirestore } from '@angular/fire/firestore';
import * as Fuse from 'fuse.js';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

const MAX_SEARCH_RESULTS = 20;

@Injectable({
  providedIn: 'root'
})
export class ProductsDataProviderService {
  private fuse = null;
  loadingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly afs: AngularFirestore) {
  }

  cacheFuze() {

    this.fetchProducts().subscribe((list) => {
      this.applyFuse(list);
    });
  }

  fetchProducts() {
    this.loadingStatus.next(true);
    const coll = this.afs.collection<IProduct>('products').snapshotChanges().pipe(map(response => {
      const products = response.map(body => {
        const newItem = body.payload.doc.data();
        newItem.id = body.payload.doc.id;
        return newItem;
      });
      this.loadingStatus.next(false);
      return products;
    }));
    coll.pipe(take(1)).subscribe((list) => {
      console.log(list);
      this.applyFuse(list);
    });
    return coll;
  }

  applyFuse(list) {
    this.fuse = new Fuse(list, {
      keys: ['id', 'name'],
    });
  }

  search(query) {
    const results = this.fuse.search(query);
    const count = results.length > MAX_SEARCH_RESULTS ? MAX_SEARCH_RESULTS : results.length;
    return of(results.slice(0, count));
  }
}
