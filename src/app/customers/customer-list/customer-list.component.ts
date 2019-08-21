import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomersDataProviderService } from '../../services/customers-data-provider.service';
import { ICustomer } from '../../order-interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  dataSource: MatTableDataSource<ICustomer> = new MatTableDataSource();

  columnsToDisplay = ['select', 'number', 'name', 'email', 'phone', 'address', 'star'];
  selection = new SelectionModel<ICustomer>(true, []);
  nameFilter: BehaviorSubject<string|null> = new BehaviorSubject(null);

  @ViewChild(MatPaginator, {}) paginator: MatPaginator;

  constructor(
    private customerDataProviver: CustomersDataProviderService
  ) {
    this.dataSource.data = [];
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    const customers = combineLatest(this.nameFilter).pipe(
      switchMap(([name]) => {
        const observer = this.customerDataProviver.fetchCustomers();
        return observer;
      })
    );
    customers.subscribe((list) => {
      console.log(list);
        this.dataSource.data = list;
    });
  }

  formatAddress(customer: ICustomer) {
    const parts = [];
    if (customer.house) {
      parts.push(customer.house);
    }
    if (customer.street) {
      parts.push(customer.street);
    }
    if (customer.city) {
      parts.push(customer.city);
    }
    if (customer.state) {
      parts.push(customer.state);
    }
    if (customer.zipcode) {
      parts.push(customer.zipcode);
    }
    if (customer.country) {
      parts.push(customer.country);
    }
    return parts.join(', ');
  }

  isSelected(customer) {
    return this.selection.selected.find(item => item.id === customer.id) != null;
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

  checkboxLabel(row?: ICustomer): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

}
