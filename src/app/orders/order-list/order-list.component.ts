import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { IOrder } from '../../order-interface';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PrintService } from '../../services/print.service';
import { OrdersDataProviderService } from '../../services/orders-data-provider.service';
import { ICurrency } from 'src/app/services/currency-api.service';
import { Parser } from 'json2csv';

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

  formatAddress(order: IOrder) {
    const parts = [];
    if (order.customer.house) {
      parts.push(order.customer.house);
    }
    if (order.customer.street) {
      parts.push(order.customer.street);
    }
    if (order.customer.city) {
      parts.push(order.customer.city);
    }
    if (order.customer.state) {
      parts.push(order.customer.state);
    }
    if (order.customer.zipcode) {
      parts.push(order.customer.zipcode);
    }
    if (order.customer.country) {
      parts.push(order.customer.country);
    }
    return parts.join(', ');
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

  isSelected(order) {
    return this.selection.selected.find(item => item.id === order.id) != null;
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

  exportToCSV() {
    const csvData: any = this.generateExportCSV();
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    const currentDate = new Date();
    a.download = `orders-export-${currentDate.toDateString()}.csv`;
    a.click();
  }

  generateExportCSV() {
    const orders = this.selection.selected;
    if (orders.length > 0) {
      const fields = [
        'NameTo',
        'StreetTo',
        'HomeNumber',
        'CityTo',
        'StateTo',
        'CountryTo',
        'ZipTo',
        'EmailTo',
        'TelTo',
        'UserIntNo',
        'Type'];
  
        orders.sort((a, b) => {
          return a.items.length - b.items.length;
        });
        const maxOrderItems = orders[0].items.length;
        console.log('maxOrderItems', maxOrderItems);
        for (let i = 0; i < maxOrderItems; i++) {
          fields.push(`Contents${i + 1}`);
          fields.push(`Currency${i + 1}`);
          fields.push(`Value${i + 1}`);
          fields.push(`Quantity${i + 1}`);
          fields.push(`CountryOfOrigin${ i + 1 }`);
        }
        orders.sort((a, b) => {
          return a.comaxDocNumber - b.comaxDocNumber;
        });
        const list = orders.map(order => {
          const row: any = {
            NameTo: order.customer.name,
            StreetTo: order.customer.street,
            HomeNumber: order.customer.house,
            CityTo: order.customer.city,
            StateTo: order.customer.state,
            CountryTo: order.customer.country,
            ZipTo: order.customer.zipcode,
            EmailTo: order.customer.email,
            TelTo: order.customer.phone,
            UserIntNo: order.comaxDocNumber,
            Type: 1
          };
          let counter = 1;
          for(const item of order.items){
              row['Contents' + counter] = item.id;
              row['Currency' + counter] = order.customer.currency;
              row['Value' + counter] = item.discountedPrice;
              row['Quantity' + counter] = item.quantity;
              row['CountryOfOrigin' + counter] = 'IL';
              counter++;
          }
          return row;
        });
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(list);
        return csv;
    }
  }
}
