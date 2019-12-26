import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from '../services/authentication.guard';
import { OrderListComponent } from './order-list/order-list.component';
import { NewOrderComponent } from './new-order/new-order.component';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { ShippingResolver } from './shipping-resolver';
import { OrderSketchComponent } from './order-sketch/order-sketch.component';

const routes: Routes = [
  { path: 'orders', redirectTo: 'orders/list', pathMatch: 'full' },
  {
    path: 'orders/list',
    component: OrderListComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Orders' }
  },
  {
    path: 'orders/new',
    component: NewOrderComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'New order' }
  },
  {
    path: 'orders/edit/:id',
    component: EditOrderComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Edit order' }
  },
  {
    path: 'orders/sketch/:id',
    component: OrderSketchComponent,
    canActivate: [AuthenticationGuard],
    data: { title: 'Sketch for order' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class OrdersRoutingModule { }
