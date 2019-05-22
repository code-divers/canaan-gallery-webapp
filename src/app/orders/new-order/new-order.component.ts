import { Component, OnInit } from '@angular/core';
import { FormControl, FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Order, Customer, Product } from '../order-interface';
import { switchMap } from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import { ItemDetailsComponent } from '../item-details/item-details.component';

@Component({
  selector: 'canaan-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  ordersCollection: AngularFirestoreCollection<Order>;
  orders: Observable<Order[]>;

  filterCustomerInput: FormControl = new FormControl();
  filterProductsInput: FormControl = new FormControl();
  orderForm: FormGroup;

  customersCollection: AngularFirestoreCollection<Customer>;
  customers: Observable<Customer[]>;
  customerFilter: BehaviorSubject<string|null>;

  productsCollection: AngularFirestoreCollection<Product>;
  products: Observable<Product[]>;
  productsFilter: BehaviorSubject<string|null>;

  currencies =  ['ILS', 'USD' ];
  discountedPrice = 0;

  constructor(
    public dialog: MatDialog,
    private readonly afs: AngularFirestore,
    private fb: FormBuilder) {
    this.ordersCollection = afs.collection<Order>('orders');
    this.orders = this.ordersCollection.valueChanges();

    this.customersCollection = afs.collection<Customer>('customers');
    this.customerFilter = new BehaviorSubject(null);
    this.customers = combineLatest(this.customerFilter).pipe(switchMap(([name]) => {
      return afs.collection<Customer>('customers', ref => {
        let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
          if (name) { query = query.orderBy('name').startAt(name).endAt(name + '\uf8ff'); }
          return query;
      }).valueChanges();
    }));

    this.productsCollection = afs.collection<Product>('products');
    this.productsFilter = new BehaviorSubject(null);
    this.products = combineLatest(this.productsFilter).pipe(switchMap(([name]) => {
      return afs.collection<Product>('products', ref => {
        let query: firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
          if (name) { query = query.orderBy('name').startAt(name).endAt(name + '\uf8ff'); }
          return query;
      }).valueChanges();
    }));
  }

  ngOnInit() {
    this.orderForm = this.fb.group({
      created: [new Date()],
      currency: ['', Validators.required],
      discount: [0],
      discountedPrice: [0],
      isExport: [''],
      shipping: [''],
      price: [0],
      subtotal: [0],
      customer: this.fb.group({
        name: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: [''],
        country: ['', Validators.required],
        phone: ['', Validators.required],
        email: ['', Validators.required],
        zipcode: ['', Validators.required]
      }),
      items: this.fb.array([])
    });

    this.orderForm.get('shipping').valueChanges.subscribe((shipping) => {
      const price = this.orderForm.get('price').value;
      const subtotal = price + Number(shipping);
      this.orderForm.patchValue({
        subtotal: subtotal
      });
    });

    this.orderForm.get('price').valueChanges.subscribe((price) => {
      const shipping = this.orderForm.get('shipping').value;
      const subtotal = price + Number(shipping);
      this.orderForm.patchValue({
        subtotal: subtotal
      });
    });

    this.orderForm.get('items').valueChanges.subscribe((items) => {
      let price = 0;
      items.forEach(item => {
        price += item.price;
      });
      this.orderForm.patchValue({
        price: price
      });
    });

    this.filterCustomerInput.valueChanges.subscribe((query) => {
      this.customerFilter.next(query);
    });

    this.filterProductsInput.valueChanges.subscribe((query) => {
      this.productsFilter.next(query);
    });
  }

  onCustomerSelect(customer) {
    this.orderForm.patchValue({
      customer: customer
    });
  }

  onCurrencyChange(currency) {
    const isExport = currency === 'USD' ? true : false;
    this.orderForm.patchValue({
      isExport: isExport
    });
  }

  onProductSelect(product) {
    if (product.studio > 0) {
      const dialogRef = this.dialog.open(ItemDetailsComponent, {
        data: product
      });
      dialogRef.afterClosed().subscribe(details => {
        if (details) {
          this.addItem(product, details);
        }
      });
    } else {
      this.addItem(product);
    }
  }

  productFilterResult(value) {
    return '';
  }

  addItem(product:Product, details:any = null) {
    const items = this.orderForm.get('items') as FormArray;
    /*let index = 0;
    for (const item of items.value) {
      if (item.name === product.name) {
        items.controls[index].patchValue({
          quantity: item.quantity + 1
        });
        return;
      }
      index++;
    }*/
    items.push(this.createItem(product, details));
  }

  createItem(product:Product, details:any = null) {
    const formGroup: FormGroup = this.fb.group({
      name: [product.name],
      price: [product.price],
      quantity: [1]
    });
    if (details) {
      formGroup.addControl('details', this.fb.group({
        atara: [details.atara],
        corners: this.fb.group({
          topLeft: this.fb.control(details.corners.topLeft),
          topRight: this.fb.control(details.corners.topRight),
          bottomLeft: this.fb.control(details.corners.bottomLeft),
          bottomRight: this.fb.control(details.corners.bottomRight),
        })
      }));
    }
    formGroup.get('quantity').valueChanges.subscribe((quantity) => {
      formGroup.patchValue({
        price: product.price * Number(quantity)
      })
    })
    return formGroup;
  }

  removeItem(index) {
    const items = this.orderForm.get('items') as FormArray;
    items.removeAt(index);
  }

  getItemsControls(){
    const formArr = this.orderForm.get('items') as FormArray;
    return formArr.controls;
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.orderForm.value);
  }

}
