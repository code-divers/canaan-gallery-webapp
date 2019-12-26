import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { IOrder, ICustomer, IProduct, IOrderItem } from '../../order-interface';
import { switchMap, catchError, } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ItemDetailsComponent } from '../item-details/item-details.component';
import { OrderCommentsComponent } from '../order-comments/order-comments.component';
import { ICurrency } from '../../services/currency-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomersDataProviderService } from '../../services/customers-data-provider.service';
import { ProductsDataProviderService } from '../../services/products-data-provider.service';
import { CurrencyApiService } from '../../services/currency-api.service';
import { NominatimService } from '../../services/nominatim.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'canaan-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  currency: ICurrency;
  currencies: ICurrency[] = [];
  ordersCollection: AngularFirestoreCollection<IOrder>;
  orders: Observable<IOrder[]>;
  isOrderLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  orderLoding: boolean;

  filterCustomerInput: FormControl = new FormControl();
  filterProductsInput: FormControl = new FormControl();
  orderForm: FormGroup;

  customersCollection: AngularFirestoreCollection<IOrder>;
  customers: Observable<ICustomer[]>;
  isCustomersLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  customerFilter: BehaviorSubject<string|null>;
  addresses: [];

  shipping: IProduct;
  products: Observable<IProduct[]>;
  isProductsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  productsFilter: BehaviorSubject<string|null>;

  discountedPrice = 0;
  isCustomerLookup = false;
  selectedCustomer = null;
  @ViewChild('customerNameInput') customerNameInput: ElementRef<HTMLInputElement>;
  @ViewChild('customerNameAuto') customerNameAuto: MatAutocomplete;

  @ViewChild(MatAutocompleteTrigger) productNameInput: MatAutocompleteTrigger;
  @ViewChild('productNameAuto') productNameAuto: MatAutocomplete;

  constructor(
    public dialog: MatDialog,
    private readonly afs: AngularFirestore,
    private fns: AngularFireFunctions,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private customerDataProvider: CustomersDataProviderService,
    private productsDataprovider: ProductsDataProviderService,
    private currencyApi: CurrencyApiService, 
    private nominatim: NominatimService) {

  }

  ngOnInit() {
    this.currencyApi.fetchMainCurrencies().subscribe(currencies=>{
      this.currencies = currencies;
      this.currency = this.currencies.find(item => {
        return item.id === 'USD';
      });
    })

    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.orders = this.ordersCollection.valueChanges();
    this.isOrderLoading.subscribe((value) => {
      this.orderLoding = value;
    });
    this.customersCollection = this.afs.collection<IOrder>('customers');
    this.customerFilter = new BehaviorSubject(null);
    this.customers = combineLatest(this.customerFilter).pipe(switchMap(([name]) => {
      if (!name) {
        return of([]);
      }
      const list = this.customerDataProvider.search(name);
      return of(list);
    }));

    this.productsFilter = new BehaviorSubject(null);
    this.products = combineLatest(this.productsFilter).pipe(switchMap(([name]) => {
      if (!name) {
        return of([]);
      }
      const products = this.productsDataprovider.search(name);
      return of(products);
    }));

    this.orderForm = this.fb.group({
      created: [new Date()],
      discount: [0],
      isEditDiscount: [false],
      shipping: [0],
      price: [0],
      subtotal: [0],
      customer: this.fb.group({
        id: [null],
        name: ['', Validators.required],
        address: [''],
        street: [''],
        house: [''],
        city: [''],
        state: [''],
        country: [''],
        phone: [''],
        email: [''],
        zipcode: [''],
        currency: [''],
        isExport: ['']
      }),
      items: this.fb.array([]),
      comments: [''],
      tags: []
    });

    this.orderForm.get('shipping').valueChanges.subscribe((shipping) => {
      const price = this.orderForm.get('price').value;
      const subtotal = price + shipping;
      this.orderForm.patchValue({
        subtotal: subtotal
      });
    });

    this.orderForm.get('price').valueChanges.subscribe((price) => {
      const shippingValue = this.orderForm.get('shipping').value;
      const subtotal = price + shippingValue;
      this.orderForm.patchValue({
        subtotal: subtotal
      });
      const items = this.orderForm.get('items').value;
      const currentPrice = this.summerizeItemsPrice(items);
      this.orderForm.patchValue({
        discount: ((currentPrice - price) / currentPrice) * 100
      });
    });

    (<FormControl>(<FormGroup>this.orderForm.get('customer')).controls['isExport']).valueChanges.subscribe((value) => {
      this.recalculateItems();
    });

    this.orderForm.get('items').valueChanges.subscribe((items) => {
      const discount = this.orderForm.get('discount').value;
      const price = this.summerizeItemsPrice(items, discount);
      this.orderForm.patchValue({
        price: price
      });
    });

    this.filterCustomerInput.valueChanges.subscribe((query) => {
      if (typeof query === 'string') {
        if (this.isCustomerLookup) {
          this.customerFilter.next(query);
        }
        (<FormGroup>this.orderForm.get('customer')).patchValue({
          name: query
        });
      }
    });

    this.filterProductsInput.valueChanges.subscribe((query) => {
      if (typeof query === 'string') {
        this.productsFilter.next(query);
      }
    });
  }
  
  onCustomerLookupToggle() {
    this.isCustomerLookup = !this.isCustomerLookup;
  }

  onCustomerSelect($event: MatAutocompleteSelectedEvent) {
    const customer = $event.option.value;
    this.orderForm.patchValue({
      customer: customer
    });
    this.selectedCustomer = customer;
    this.customerNameInput.nativeElement.value = '';
  }

  removeCustomer() {
    this.selectedCustomer = null;
    this.orderForm.patchValue({
      customer: {
        id: null,
        name: '',
        address: '',
        street: '',
        house: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        zipcode: '',
        currency: '',
        isExport: false
      }
    });
  }

  validateAddress() {
    this.addresses = [];
    const address = this.orderForm.get('customer.address').value;
    this.nominatim.searchAddress(address).subscribe((result: any) => {
      if (result.length === 0) {
        this.snackBar.open('Address does not exist', null, {
          duration: 3000
        });
      } else if (result.length === 1) {
        this.setAddressComponents(result[0]);
      } else {
        this.addresses = result;
      }
    });
  }

  onAddressSelect($event) {
    this.setAddressComponents($event.value);
  }

  setAddressComponents(components: any) {
    this.orderForm.patchValue({
      customer: {
        address: components.display_name,
        street: components.address.street || components.address.road,
        house: components.address.house_number,
        city: components.address.city,
        state: components.address.state,
        country: components.address.country,
        zipcode: components.address.postcode
      }
    });
    this.addresses = [];
  }

  onCurrencyChange(currency) {
    const isExport = currency === 'USD' ? true : false;
    const customer = {...(this.orderForm.get('customer').value), ...{isExport: isExport}};
    this.orderForm.patchValue({
      customer: customer
    });
    this.recalculateShipping();
    this.recalculateItems();
  }

  getCurrency() {
    const customer = this.orderForm.get('customer').value;
    if (customer && customer.currency) {
      return this.currencies.find((item) => {
        return item.id === customer.currency;
      });
    } else {
      return this.currencies.find((item) => {
        return item.id === 'USD';
      });
    }
  }

  getCurrencyName(){
    const currency = this.getCurrency();
    return currency ? currency.id : 'USD';
  }

  recalculateShipping(isShipping?) {
    this.orderForm.patchValue({
      shipping: this.getShippingPrice()
    });
  }

  getShippingPrice() {
    const shipping = this.orderForm.get('shipping').value;
    if ( shipping === 0 ) {
      return 0;
    }
    const isExport = this.orderForm.get('customer.isExport').value;
    const currency = this.getCurrency();
    let value = shipping / currency.rate;
    if (isExport) {
      value = value - (value * environment.vat);
    }
    return Math.ceil(value);
  }

  calculateProductPrice(product: IProduct | IOrderItem, discount = 0) {
    const isExport =  (<FormGroup>this.orderForm.get('customer')).get('isExport').value;
    const currency = this.getCurrency();
    let price = product.price;
    price = price / currency.rate;
    price = price - (price * (Number(discount) / 100));
    if (isExport) {
      price = price - (price * environment.vat);
    }
    return Math.ceil(price);
  }

  summerizeItemsPrice(items: IOrderItem[], discount = 0) {
    let price = 0;
    items.forEach(item => {
      price += item.discountedPrice;
    });
    if (discount) {
      price = price - (price * (discount / 100));
    }
    return Math.ceil(price);
  }

  recalculateItems() {
    const items = <FormArray>this.orderForm.controls['items'];
    for (const item of items.controls) {
      const quantity = item.get('quantity').value;
      this.afs.doc<IProduct>(`products/${item.value.id}`).valueChanges().subscribe(product => {
        const price = this.calculateProductPrice(product);
        item.patchValue({
          price: price,
          discountedPrice: price * Number(quantity)
        });
      });
    }
  }

  onProductSelect($event: MatAutocompleteSelectedEvent) {
    const product = $event.option.value;
    const item = this.createItem(product);
    if (product.group === environment.studioGroup) {
      this.openDetailsPanel(item).subscribe(details => {
        if (details) {
          this.addItemDetails(item, details);
          this.addItem(item);
        }
      });
    } else {
      this.addItem(item);
    }
  }

  onSetOrderComments() {
    this.openCommentsPanel(this.orderForm).subscribe((data) => {
      this.orderForm.patchValue({
        comments: data.comments,
        tags: data.tags
      });
    });
  }

  openDetailsPanel(item) {
    const dialogRef = this.dialog.open(ItemDetailsComponent, {
      data: item.value,
      width: '60%'
    });
    return dialogRef.afterClosed();
  }

  openCommentsPanel(order) {
    const dialogRef = this.dialog.open(OrderCommentsComponent, {
      data: order.value,
      width: '60%'
    });
    return dialogRef.afterClosed();
  }

  productFilterResult(value) {
    return null;
  }

  addItem(item) {
    const items = this.orderForm.get('items') as FormArray;
    items.push(item);
  }

  createItem(product: IProduct, details: any = null) {
    const price = this.calculateProductPrice(product);
    const formGroup: FormGroup = this.fb.group({
      id: [product.id],
      name: [product.name],
      price: [price],
      width: [product.width],
      height: [product.height],
      length: [product.length],
      weight: [product.weight],
      discountedPrice: [price],
      discount: [0],
      isEditDiscount: [false],
      quantity: [1],
      group: [product.group],
      details: this.fb.group({})
    });

    formGroup.get('discountedPrice').valueChanges.subscribe((value) => {
      value = value || 0;
      const currentPrice = this.calculateProductPrice(product);
      let discount = 0;
      if (currentPrice) {
        discount = ((currentPrice - value) / currentPrice) * 100;
      }
      formGroup.patchValue({
        discount: discount
      });
      if (value === 0) {
        formGroup.patchValue({
          discountedPrice: 0
        }, { emitEvent: false });
      }
    });

    formGroup.get('quantity').valueChanges.subscribe((quantity) => {
      console.log(quantity);
      const currentPrice = formGroup.get('price').value;
      formGroup.patchValue({
        discountedPrice: currentPrice * Number(quantity),
        discount: 0
      });
    });

    /* formGroup.get('discount').valueChanges.subscribe((discount) => {
      const newPrice = this.calculateProductPrice(product, discount);
      formGroup.patchValue({
        discountedPrice: newPrice
      }, { emitEvent: false });
    });*/
    
    if (details) {
      this.addItemDetails(formGroup, details);
    }
    return formGroup;
  }

  addItemDetails(formGroup: FormGroup, details) {
    if (details.studio) {
      return this.addItemStudioDetails(formGroup, details);
    } else {
      return this.addItemCommentDetails(formGroup, details);
    }
  }

  addItemCommentDetails(formGroup: FormGroup, details){
    formGroup.setControl('details', this.fb.group({
      comment: [details.comment]
    }));
    return formGroup;
  }

  addItemStudioDetails(formGroup: FormGroup, details){
    formGroup.setControl('details', this.fb.group({
      studio: this.fb.group({
        atara: [details.studio.atara],
        corners: this.fb.group({
          topLeft: this.fb.control(details.studio.corners.topLeft),
          topRight: this.fb.control(details.studio.corners.topRight),
          bottomLeft: this.fb.control(details.studio.corners.bottomLeft),
          bottomRight: this.fb.control(details.studio.corners.bottomRight),
        })
      })
    }));
    return formGroup;
  }

  removeItem(index) {
    const items = this.orderForm.get('items') as FormArray;
    items.removeAt(index);
  }

  getItemsControls() {
    const formArr = this.orderForm.get('items') as FormArray;
    return formArr.controls;
  }

  countItemDetailsControls(item) {
    const form = item.get('details') as FormGroup;
    return Object.entries(form.controls).length;
  }

  onItemDetailClick(item) {
    this.openDetailsPanel(item).subscribe((details) => {
      if (details) {
        this.addItemDetails(item, details);
      }
    });
  }

  getAllErrors(form: FormGroup | FormArray): { [key: string]: any; } | null {
    let hasError = false;
    const result = Object.keys(form.controls).reduce((acc, key) => {
        const control = form.get(key);
        const errors = (control instanceof FormGroup || control instanceof FormArray)
            ? this.getAllErrors(control)
            : control.errors;
        if (errors) {
            acc[key] = errors;
            hasError = true;
        }
        return acc;
    }, {} as { [key: string]: any; });
    return hasError ? result : null;
  }

  toggleOrderDiscount() {
    const isEditDiscount = this.orderForm.get('isEditDiscount').value;
    this.orderForm.patchValue({
      isEditDiscount: !isEditDiscount
    });
  }

  toggleItemDiscount(item: FormGroup) {
    const isEditDiscount = item.get('isEditDiscount').value;
    item.patchValue({
      isEditDiscount: !isEditDiscount
    });
  }

  isItemDetails(item: FormGroup){
    const details = item.get('details').value;
    if (details === null) {
      return false;
    }
    if (details.studio) {
      return (
        details.studio.atara ||
        details.studio.corners.topLeft ||
        details.studio.corners.topRight ||
        details.studio.corners.bottomLeft ||
        details.studio.corners.bottomRight);
    } else if (details.comment) {
      return details.comment != null;
    } else {
      return false;
    }
  }

  onSubmit() {
    this.isOrderLoading.next(true);
    const order = this.orderForm.value;
    const callable = this.fns.httpsCallable('setCustomer');
    return callable(order.customer).pipe(catchError((err) => {
      this.snackBar.open('Failed to set order customer. Please try again', 'ok', {
        duration: 5000
       });
       this.isOrderLoading.next(false);
       return of(err);
    })).subscribe((result) => {
      order.customer = result;
      return this.ordersCollection.add(order).then((doc) => {
        this.router.navigate(['orders/list']);
      }).catch((err) => {
        this.snackBar.open('Failed to save order. Please try again', 'ok', {
          duration: 5000
         });
      }).finally(() => {
        this.isOrderLoading.next(false);
      });
    });
  }
}
