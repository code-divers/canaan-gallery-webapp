import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { switchMap, take } from 'rxjs/operators';
import { IOrder, IProduct } from '../../order-interface';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PrintService } from '../../services/print.service';
import { OrdersDataProviderService } from '../../services/orders-data-provider.service';
import { CurrencyApiService } from '../../services/currency-api.service';
import { ICurrency } from 'src/app/services/currency-api.service';
import * as XLSX from 'xlsx';

const NAME_FROM = 'Canaan Gallery';
const TEL_FROM = '011-972-4697-4449';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const ITEM_SHIPMENT_NAME = 'Jewish religious art';

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
  
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  columnsToDisplay = ['select', 'number', 'created', 'customer', 'price', 'shipping', 'subtotal', 'tags', 'star'];

  selection = new SelectionModel<IOrder>(true, []);

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator, {}) paginator: MatPaginator;

  constructor(
    private readonly afs: AngularFirestore,
    private router: Router,
    private printService: PrintService,
    private currencyApiService: CurrencyApiService,
    private ordersDataService: OrdersDataProviderService) {
  }

  ngOnInit() {
    const currencies = this.currencyApiService.fetchCurrencies();
    currencies.subscribe(result=>{
      this.currency = result.find(value => {
        return value.id == 'USD'
      });
      console.log(this.currency);
    });

    this.nameFilter = new BehaviorSubject(null);
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.orders =  combineLatest(this.nameFilter).pipe(
      switchMap(([name]) => {
        if(name){
          const list = this.ordersDataService.search(name);
          return of(list);
        }
        const observer = this.ordersDataService.fetchOrders();
        return observer;
      })
    );

    this.dataSource.paginator = this.paginator;
    this.orders.subscribe(items => {
      this.dataSource.data = items;
    });
  }

  notIsloading() {
    return this.isLoading.pipe(map(value => {
      return !value;
    }));
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

  addNewOrder() {
    this.router.navigate(['orders/new']);
  }

  getOrderCurrency(order){
    return order.customer.currency.toUpperCase();
  }

  printOrder(order: IOrder): void {
    this.printService.printDocument('order', order.id);
  }

  printRecipt(order: IOrder) {
    this.isLoading.next(true);
    this.ordersDataService.setRecipt(order).subscribe
    ((result) => {
      this.isLoading.next(false);
      this.printService.printDocument('recipt', order.id);
    });
  }

  isOrderTagged(order: IOrder, tag){
    return order.tags && order.tags.indexOf(tag) > -1;
  }

  tagOrder(order: IOrder, tag) {
    if (this.isOrderTagged(order, tag)) {
      return;
    }
    if(!order.tags) {
      order.tags = [];
    }
    order.tags.push(tag);
    this.updateOrder(order);
  }

  removeOrderTag(order: IOrder, tag) {
    const idx = order.tags.indexOf(tag);
    order.tags.splice(idx, 1);
    this.updateOrder(order);
  }

  updateOrder(order: IOrder) {
    const doc = this.afs.doc<IOrder>(`orders/${order.id}`);
    doc.update(order).then(result => {
      console.log(result);
    });
  }

  isSelected(order) {
    return this.selection.selected.find(item => item.id === order.id) != null;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    return numSelected === this.dataSource.data.length;
  }

  masterToggle() {
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
    const csvData: any = this.generateExport();
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    const data: Blob = new Blob([csvData], {type: EXCEL_TYPE});
    const url = window.URL.createObjectURL(data);
    a.href = url;
    const currentDate = new Date();
    a.download = `orders-export-${currentDate.toDateString()}.${EXCEL_EXTENSION}`;
    a.click();
    this.markShippedOrders();
  }

  generateExport() {
    const orders = this.selection.selected;
    if (orders.length > 0) {
        orders.sort((a, b) => {
          return a.comaxDocNumber - b.comaxDocNumber;
        });
        const list = orders.map((order, idx) => {
          const measures = this.calculatePackageMeasurments(order.items);
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
            CompanyTo: '',
            PositionTo: '',
            ImporterRef: '',
            ItemDesc: ITEM_SHIPMENT_NAME,
            Type: 1,
            Length: measures.length,
            Height: measures.height,
            Width: measures.width,
            GrossWeight: measures.grossWeight,
            IncludeIns: '',
            ContValue: order.subtotal,
            NameFrom: NAME_FROM,
            TelFrom: TEL_FROM,
            ShipmnetID: idx + 1
          };
          const maxOrderItems = order.items.length < 4 ? 4 : order.items.length;
          for(let i=0; i < maxOrderItems; i++){
            const counter = i+1;
            let item = null;
            if(order.items.length > i){
              item = order.items[i]
            }
            
            row['Contents' + counter] = item ? this.getItemShippingName(item) : '';
            row['Currency' + counter] = item ? order.customer.currency : '';
            row['Value' + counter] = item ? item.discountedPrice : '';
            row['Quantity' + counter] = item ? item.quantity : '';
            row['CountryOfOrigin' + counter] = item ? 'IL' : '';
            row['Weight' + counter] = item ? item.weight : '';
            row['HsTariff' + counter] = '';
          }
          return row;
        });
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(list);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        return excelBuffer;
    }
  }

  calculatePackageMeasurments(items: IProduct[]){
    const measures = {
      width: 0,
      height: 0,
      length: 0,
      grossWeight: 0.1
    }
    for(const item of items){
      measures.width = Number(item.width) > measures.width ? Number(item.width) : measures.width;
      measures.height = Number(item.height) > measures.height ? Number(item.height) : measures.height;
      measures.length = measures.length + Number(item.length);
      measures.grossWeight = measures.grossWeight + Number(item.weight);
    }
    return measures;
  }

  getItemShippingName(item) {
    let result = 'Jewish';
    switch (item.group) {
      case 'כיפה':
        result = 'Kipa';
        break;
      case 'טלית':
        result = 'Talit';
        break;
      case 'מנורה':
        result = 'Menorah';
        break;
      case 'מזוזה':
        result = 'Mezuzah';
        break;
      case 'חמסה':
        result = 'Hamsa';
        break;
      case 'כיסוי מצה':
        result = 'Matzah cover';
        break;
      case 'כיסוי חלה':
        result = 'Challa cover';
        break;
      case 'צעיף':
        result = 'Scarf';
        break;
    }
    result = `${result} religious article`;
    return result;
  }

  async markShippedOrders() {
    const orders = this.selection.selected;
    for (const order of orders) {
      await this.tagOrder(order, 'shipped');
    }
  }
}
