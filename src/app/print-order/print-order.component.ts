import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOrder } from '../orders/order-interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { PrintService } from '../services/print.service';

@Component({
  selector: 'print-order',
  templateUrl: './print-order.component.html',
  styleUrls: ['./print-order.component.scss']
})
export class PrintOrderComponent implements OnInit {
  order: any = null;
  constructor(
    private route: ActivatedRoute,
    private readonly afs: AngularFirestore,
    private printService: PrintService) {
  }

  ngOnInit() {
    const id = this.route.snapshot.params['orderId'];
    this.afs.doc<IOrder>(`orders/${id}`).valueChanges().subscribe(order => {
      this.order = order;
      this.printService.onDataReady();
    });
  }

}
