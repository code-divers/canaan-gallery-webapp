import { Component, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { PrintService } from './services/print.service';
import { ProductsDataProviderService } from './services/products-data-provider.service';
import { CustomersDataProviderService } from './services/customers-data-provider.service';
import { OrdersDataProviderService } from './services/orders-data-provider.service';
import { map } from 'rxjs/operators';
import { merge } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'webapp';
  isCustomersLoading = false;
  isProductsLoading = false;
  isOrdersLoading = false;
  constructor(
    private meta: Meta,
    public printService: PrintService,
    private productsDataProvider: ProductsDataProviderService,
    private customersDataProvider: CustomersDataProviderService, private ordersDataProvider: OrdersDataProviderService) { }

  ngOnInit() { }

  isLoading() {
    return merge(
      this.ordersDataProvider.loadingStatus,
      this.customersDataProvider.loadingStatus,
      this.productsDataProvider.loadingStatus);
  }

  isNotLoading() {
    return this.isLoading().pipe(map(value => {
        return !value;
      }));
  }
}
