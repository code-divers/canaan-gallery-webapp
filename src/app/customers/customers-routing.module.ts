import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { AuthenticationGuard } from '../services/authentication.guard';

const routes: Routes = [
  { path: 'customers', redirectTo: 'customers/list', pathMatch: 'full' },
  {
    path: 'customers/list',
    component: CustomerListComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Customer list' },
    resolve: {}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
