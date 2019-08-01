import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { IOrder } from '../order-interface';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PrintService } from '../../services/print.service';
import { OrdersDataProviderService } from '../../services/orders-data-provider.service';
import { ICurrency } from 'src/app/services/currency-api.service';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  private ordersCollection: AngularFirestoreCollection<IOrder>;
  orders: Observable<IOrder[]>;
  dataSource: MatTableDataSource<IOrder> = new MatTableDataSource();
  nameFilter: BehaviorSubject<string|null>;
  currency: ICurrency;

  columnsToDisplay = ['select', 'number', 'created', 'customer', 'price', 'shipping', 'subtotal', 'star'];

  selection = new SelectionModel<IOrder>(true, []);

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private readonly afs: AngularFirestore,
    private router: Router,
    private printService: PrintService,
    private activatedRoute: ActivatedRoute,
    private ordersDataService: OrdersDataProviderService) {
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((res) => {
      this.currency = res.cres.find((item => {
        return item.id === 'USD';
      }));
    });
    
    this.nameFilter = new BehaviorSubject(null);
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.orders =  combineLatest(this.nameFilter).pipe(
      switchMap(([name]) => {
        const observer = this.ordersDataService.fetchOrders(name);
        return observer;
      })
    );

    this.orders.subscribe(items => {
      this.dataSource.data = items;
    });
  }

  applyFilter(filterValue: string) {
    this.nameFilter.next(filterValue);
  }

  addNewOrder(){
    this.router.navigate(['orders/new']);
  }

  getOrderCurrency(order){
    return order.customer.currency.toUpperCase();
  }

  printDialog(order: IOrder): void {
    this.printService.printDocument('receipt', order.id);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    return numSelected === this.dataSource.data.length;
  }

  masterToggle() {
    console.log(this.isAllSelected());
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: IOrder): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }



}
