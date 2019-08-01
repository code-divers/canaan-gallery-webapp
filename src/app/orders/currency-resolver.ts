import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { first } from 'rxjs/operators';
import { CurrencyApiService, ICurrency } from '../services/currency-api.service';

@Injectable()
export class CurrencyResolver implements Resolve<ICurrency[]> {
    private list: ICurrency[] = [];
    constructor(
        private service: CurrencyApiService
    ) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): any {
        if (this.list.length > 0) {
            return new Promise(resolve => resolve(this.list));
        } else {
            const doc = this.service.filteredCurrencies.pipe(first()).toPromise();
            return doc.then(data => {
                this.list = data;
                return data;
            });
        }
    }
}
