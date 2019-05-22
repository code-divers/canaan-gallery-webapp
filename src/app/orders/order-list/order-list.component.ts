import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Order } from '../order-interface';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  private ordersCollection: AngularFirestoreCollection<Order>;
  orders: Observable<Order[]>;
  nameFilter: BehaviorSubject<string|null>;

  columnsToDisplay = ['created', 'customer', 'price', 'shipping', 'subtotal', 'star'];
  selection = new SelectionModel<any>(false, []);

  constructor(private readonly afs: AngularFirestore, private router: Router) {
    this.nameFilter = new BehaviorSubject(null);
    this.ordersCollection = afs.collection<Order>('orders');
    this.orders =  combineLatest(this.nameFilter).pipe(
      switchMap(([name]) => {
        return afs.collection<Order>('orders', ref => {
          let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
          if (name) { query = query.orderBy('customer.name').startAt(name).endAt(name + '\uf8ff')}
          return query;
        }).valueChanges();
      })
    );
  }

  ngOnInit() {

  }

  applyFilter(filterValue: string) {
    this.nameFilter.next(filterValue);
  }

  addNewOrder(){
    this.router.navigate(['orders/new']);
  }

}
