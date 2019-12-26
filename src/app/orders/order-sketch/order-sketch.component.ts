import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { IOrder } from '../../order-interface';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'order-sketch',
  templateUrl: './order-sketch.component.html',
  styleUrls: ['./order-sketch.component.scss']
})
export class OrderSketchComponent implements OnInit {
  orderRef: AngularFirestoreDocument<IOrder>;
  order: Observable<IOrder>;
  imageName: BehaviorSubject<string> = new BehaviorSubject(null);
  bgUrl: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor(
    private activatedRoute: ActivatedRoute,
    private readonly afs: AngularFirestore,
    private router: Router
    ) { }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.orderRef = this.afs.doc<IOrder>(`orders/${id}`);
    this.order = this.orderRef.valueChanges();
    this.order.subscribe(order => {
      this.imageName.next('sketch-order-' + order.id);
      this.bgUrl.next(order.sketchUrl);
    });
  }

  onCanvasSave(imageUrl) {
    return this.orderRef.update({
      sketchUrl: imageUrl
    }).then((val) => {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      this.router.navigate(['orders/edit/', id]);
    });
  }

}
