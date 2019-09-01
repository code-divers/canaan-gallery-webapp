import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerLeadComponent } from './customer-lead/customer-lead.component';
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
  {
    path: 'customers/lead',
    component: CustomerLeadComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Register' },
    resolve: {}
  },
  {
    path: 'customers/lead/:id',
    component: CustomerLeadComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Edit customer' },
    resolve: {}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
