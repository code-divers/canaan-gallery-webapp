import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationGuard } from './services/authentication.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { PrintLayoutComponent } from './print-layout/print-layout.component';
import { PrintOrderComponent } from './print-order/print-order.component';
import { PrintReciptComponent } from './print-recipt/print-recipt.component';

const routes: Routes = [
  { path: '',   redirectTo: '/orders/list', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Login' } },
  { path: '**', component: PageNotFoundComponent , data: { title: '404' }},
  { path: 'print',
    outlet: 'print',
    component: PrintLayoutComponent,
    children: [
      { path: 'order/:orderId', component: PrintOrderComponent },
      { path: 'recipt/:orderId', component: PrintReciptComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
