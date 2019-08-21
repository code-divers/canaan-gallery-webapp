import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, map, catchError } from 'rxjs/operators';
import { IProduct } from '../order-interface';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class ShippingResolver implements Resolve<IProduct> {
    constructor(
        private readonly afs: AngularFirestore
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): any {
        return this.afs.doc<IProduct>('products/1366').valueChanges().pipe(first());
    }
}
