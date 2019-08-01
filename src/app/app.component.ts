import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { PrintService } from './services/print.service';
import { ProductsDataProviderService } from './services/products-data-provider.service';
import { CustomersDataProviderService } from './services/customers-data-provider.service';
import { OrdersDataProviderService } from './services/orders-data-provider.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'webapp';
  isCustomersLoading = true;
  isProductsLoading = true;
  isOrdersLoading = true;
  constructor(
    private meta: Meta,
    public printService: PrintService,
    private productsDataProvider: ProductsDataProviderService,
    private customersDataProvider: CustomersDataProviderService, private ordersDataProvider: CustomersDataProviderService) {
      this.productsDataProvider.loadingStatus.subscribe(status => {
        this.isProductsLoading = status;
      });

      this.customersDataProvider.loadingStatus.subscribe(status => {
        this.isCustomersLoading = status;
      });

      this.ordersDataProvider.loadingStatus.subscribe(status => {
        this.isOrdersLoading = status;
      });
  }
}
