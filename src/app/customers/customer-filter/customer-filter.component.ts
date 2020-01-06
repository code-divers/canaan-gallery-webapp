import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ICustomer } from '../../order-interface';
import { CustomersDataProviderService } from '../../services/customers-data-provider.service';

@Component({
  selector: 'customer-filter',
  templateUrl: './customer-filter.component.html',
  styleUrls: ['./customer-filter.component.scss']
})
export class CustomerFilterComponent implements OnInit {
  customers: Observable<ICustomer[]>;
  filterCustomerInput: FormControl = new FormControl();
  customerFilter: BehaviorSubject<string|null>;
  selectedCustomer = null;

  constructor(
    private dataProvider: CustomersDataProviderService
  ) { }

  ngOnInit() {
    this.customerFilter = new BehaviorSubject(null);
    this.customers = combineLatest(this.customerFilter).pipe(switchMap(([name]) => {
      if (!name) {
        return of([]);
      }
      return this.dataProvider.search(name);
    }));
    this.filterCustomerInput.valueChanges.subscribe((query) => {
      if (typeof query === 'string') {
        this.customerFilter.next(query);
      }
    });
  }

  removeCustomer() {
    this.selectedCustomer = null;
  }

}
