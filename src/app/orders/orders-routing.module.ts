import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from '../services/authentication.guard';
import { OrderListComponent } from './order-list/order-list.component';
import { NewOrderComponent } from './new-order/new-order.component';

const routes: Routes = [
  { path: 'orders', redirectTo: 'orders/list', pathMatch: 'full' },
  { path: 'orders/list', component: OrderListComponent, canActivate: [AuthenticationGuard], data: { title: 'Orders' }},
  { path: 'orders/new', component: NewOrderComponent, canActivate: [AuthenticationGuard], data: { title: 'New order' }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
