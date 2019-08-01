import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from '../services/authentication.guard';
import { OrderListComponent } from './order-list/order-list.component';
import { NewOrderComponent } from './new-order/new-order.component';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { CurrencyResolver } from './currency-resolver';
import { ShippingResolver } from './shipping-resolver';

const routes: Routes = [
  { path: 'orders', redirectTo: 'orders/list', pathMatch: 'full' },
  {
    path: 'orders/list',
    component: OrderListComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Orders' },
    resolve: {cres: CurrencyResolver}
  },
  {
    path: 'orders/new',
    component: NewOrderComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'New order' },
    resolve: {cres: CurrencyResolver, sres: ShippingResolver}
  },
  {
    path: 'orders/edit/:id',
    component: EditOrderComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Edit order' },
    resolve: {cres: CurrencyResolver, sres: ShippingResolver}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CurrencyResolver, ShippingResolver]
})
export class OrdersRoutingModule { }
