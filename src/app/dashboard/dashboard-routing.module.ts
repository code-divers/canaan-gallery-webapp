import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatisticsComponent } from './statistics/statistics.component';
import { QuestionsComponent } from './questions/questions.component';
import { AuthenticationGuard } from '../services/authentication.guard';

const routes: Routes = [
  { path: 'dashboard', redirectTo: 'dashboard/questions', pathMatch: 'full' },
  { path: 'dashboard/statistics', component: StatisticsComponent, canActivate: [AuthenticationGuard], data: { title: 'Statistics' }},
  { path: 'dashboard/questions', component: QuestionsComponent, canActivate: [AuthenticationGuard], data: { title: 'Questions' }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
