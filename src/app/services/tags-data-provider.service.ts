import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITag } from '../order-interface';
import * as Fuse from 'fuse.js';

const MAX_SEARCH_RESULTS = 100;

@Injectable({
  providedIn: 'root'
})
export class TagsDataProviderService {
  private fuse = null;

  loadingStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly afs: AngularFirestore) {
  }

  cacheFuze() {
    this.fetchTags().subscribe((list) => {
      this.applyFuse(list);
    });
  }

  fetchTags() {
    this.loadingStatus.next(true);
    return this.afs.collection<ITag>('tags').snapshotChanges().pipe(map(response => {
      const list = response.map(body => {
        const newItem = body.payload.doc.data();
        newItem.id = body.payload.doc.id;
        return newItem;
      });
      this.applyFuse(list);
      this.loadingStatus.next(false);
      return list;
    }));
  }

  applyFuse(list) {
    this.fuse = new Fuse(list, {
      keys: ['name']
    });
  }

  search(query) {
    const results = this.fuse.search(query);
    const count = results.length > MAX_SEARCH_RESULTS ? MAX_SEARCH_RESULTS : results.length;
    return results.slice(0, count);
  }
}
