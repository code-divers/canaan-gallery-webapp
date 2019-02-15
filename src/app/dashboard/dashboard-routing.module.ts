import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatisticsComponent } from './statistics/statistics.component';
import { AuthenticationGuard } from '../services/authentication.guard';

const routes: Routes = [
	{ path: 'dashboard', redirectTo: 'dashboard/statistics', pathMatch: 'full' },
	{ path: 'dashboard/statistics', component: StatisticsComponent, canActivate: [AuthenticationGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
