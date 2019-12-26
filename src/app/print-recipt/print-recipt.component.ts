import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOrder } from '../order-interface';
import { AngularFirestore } from '@angular/fire/firestore';
import { PrintService } from '../services/print.service';

@Component({
  selector: 'print-recipt',
  templateUrl: './print-recipt.component.html',
  styleUrls: ['./print-recipt.component.scss']
})
export class PrintReciptComponent implements OnInit {
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

  formatAddress(order: IOrder) {
    const parts = [];
    if (order.customer.house) {
      parts.push(order.customer.house);
    }
    if (order.customer.street) {
      parts.push(order.customer.street);
    }
    if (order.customer.city) {
      parts.push(order.customer.city);
    }
    if (order.customer.state) {
      parts.push(order.customer.state);
    }
    if (order.customer.zipcode) {
      parts.push(order.customer.zipcode);
    }
    return parts.join(', ');
  }

}
