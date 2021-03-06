import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { NewOrderComponent } from './new-order/new-order.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { TruncatePipe } from '../truncate-pipe';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { OrderCommentsComponent } from './order-comments/order-comments.component';
import { SketchComponent } from '../sketch/sketch.component';
import { OrderSketchComponent } from './order-sketch/order-sketch.component';

@NgModule({
  declarations: [
    OrderListComponent,
    NewOrderComponent,
    ItemDetailsComponent,
    TruncatePipe,
    EditOrderComponent,
    OrderCommentsComponent,
    OrderSketchComponent,
    SketchComponent],
  entryComponents: [
    ItemDetailsComponent, OrderCommentsComponent
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSortModule,
    MatMenuModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatListModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    OrdersRoutingModule
  ]
})
export class OrdersModule { }
