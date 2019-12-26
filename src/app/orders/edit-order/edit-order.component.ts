import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { IOrder, IOrderItem, ICustomer, IProduct, IProductGroup } from '../../order-interface';
import { switchMap, map, catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ItemDetailsComponent } from '../item-details/item-details.component';
import { OrderCommentsComponent } from '../order-comments/order-comments.component';
import { ICurrency } from '../../services/currency-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductsDataProviderService } from '../../services/products-data-provider.service';
import { OrdersDataProviderService } from '../../services/orders-data-provider.service';
import { CurrencyApiService } from '../../services/currency-api.service';
import { NominatimService } from '../../services/nominatim.service';
import { PrintService } from '../../services/print.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'canaan-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.scss']
})
export class EditOrderComponent implements OnInit {
  currency: ICurrency;
  currencies: ICurrency[] = [];
  orderId;
  reciptId;
  orderDoc: AngularFirestoreDocument<IOrder>;
  order: Observable<IOrder>;
  ordersCollection: AngularFirestoreCollection<IOrder>;
  orders: Observable<IOrder[]>;
  isOrderLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
  orderLoding: boolean;

  filterCustomerInput: FormControl = new FormControl();
  filterProductsInput: FormControl = new FormControl();
  orderForm: FormGroup;

  customers: Observable<ICustomer[]>;
  isCustomersLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  customerFilter: BehaviorSubject<string|null>;
  addresses: [];

  shipping: IProduct;
  productGroups: Observable<IProductGroup[]>;
  selectedProductGroup: string = null;
  products: Observable<IProduct[]>;
  isProductsLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  productsFilter: BehaviorSubject<string|null>;
  discountedPrice = 0;

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
    private productsDataprovider: ProductsDataProviderService,
    private ordersDataprovider: OrdersDataProviderService,
    private currencyApi: CurrencyApiService, 
    private printService: PrintService,
    private nominatim: NominatimService) {

  }

  ngOnInit() {
    this.currencyApi.fetchMainCurrencies().subscribe(currencies=>{
      this.currencies = currencies;
      this.currency = this.currencies.find(item => {
        return item.id === 'USD';
      });
    })

    this.isOrderLoading.subscribe((value) => {
      this.orderLoding = value;
    });
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.orderDoc = this.afs.doc<IOrder>(`orders/${id}`);
    this.order = this.orderDoc.valueChanges();
    this.ordersCollection = this.afs.collection<IOrder>('orders');
    this.orders = this.ordersCollection.valueChanges();
    
    this.orderForm = this.fb.group({
      comaxDocNumber: [null],
      created: [new Date()],
      discount: [0],
      isEditDiscount: [false],
      discountedPrice: [0],
      shipping: [0],
      price: [0],
      subtotal: [0],
      customer: this.fb.group({
        id: [null],
        name: [''],
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
    
    this.order.subscribe((result: IOrder) => {
      this.orderId = result.comaxDocNumber || id;
      this.reciptId = result.comaxReciptDocNumber;
      if (result.created) {
        result.created = result.created.toDate();
      }
      this.orderForm.patchValue(result);
      for (const item of result.items) {
        const formGroupItem = this.createFormGroupItem(item);
        this.addItem(formGroupItem);
      }
      this.selectedCustomer = result.customer;
      this.subscribeToOrder();
      this.isOrderLoading.next(false);
    });

    this.productsFilter = new BehaviorSubject(null);
    this.products = combineLatest(this.productsFilter).pipe(switchMap(([name]) => {
      if (!name) {
        return of([]);
      }
      const products = this.productsDataprovider.search(name);
      return of(products);
    }));

    this.filterProductsInput.valueChanges.subscribe((query) => {
      if (typeof query === 'string') {
        this.productsFilter.next(query);
      }
    });
  }

  subscribeToOrder() {
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

    /*this.orderForm.get('discount').valueChanges.subscribe((discount) => {
      const items = this.orderForm.get('items').value;
      const shippingValue = this.orderForm.get('shipping').value;
      const price = this.summerizeItemsPrice(items, discount);
      const subtotal = price + shippingValue;
      this.orderForm.patchValue({
        price: price,
        subtotal: subtotal
      }, { emitEvent: false });
    });*/

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

  openDetailsPanel(item) {
    const dialogRef = this.dialog.open(ItemDetailsComponent, {
      data: item.value,
      width: '60%'
    });
    return dialogRef.afterClosed();
  }

  productFilterResult(value) {
    return '';
  }

  addItem(item) {
    const items = this.orderForm.get('items') as FormArray;
    items.push(item);
  }

  createFormGroupItem(item: IOrderItem){
    const formGroup: FormGroup = this.fb.group({
      id: [item.id],
      name: [item.name],
      price: [item.price],
      width: [item.width],
      height: [item.height],
      length: [item.length],
      weight: [item.weight],
      discountedPrice: [item.discountedPrice],
      discount: [item.discount],
      isEditDiscount: [item.isEditDiscount],
      quantity: [item.quantity],
      group: [item.group],
      details: this.fb.group({})
    });
    if (item.details) {
      this.addItemDetails(formGroup, item.details);
    }
    this.subscribeItem(formGroup, item);
    return formGroup;
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
    if (details) {
      this.addItemDetails(formGroup, details);
    }
    this.subscribeItem(formGroup, product);
    return formGroup;
  }

  subscribeItem(formGroup: FormGroup, product: IProduct | IOrderItem) {
    formGroup.get('discountedPrice').valueChanges.subscribe((value) => {
      value = value || 0;
      const currentPrice = formGroup.get('price').value;
      let discount = 0;
      if (currentPrice !== 0) {
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
      const currentPrice = formGroup.get('price').value;
      formGroup.patchValue({
        discountedPrice: currentPrice * Number(quantity),
        discount: 0
      }, { emitEvent: false });
    });

    /*formGroup.get('discount').valueChanges.subscribe((discount) => {
      const newPrice = this.calculateProductPrice(product, discount);
      formGroup.patchValue({
        discountedPrice: newPrice
      }, { emitEvent: false });
    });*/
  }

  calculateDiscountedItemPrice(item: IOrderItem | IProduct , discount) {
    let price = item.price;
    price = price - (price * (Number(discount) / 100));
    return Math.ceil(price);
  }

  addItemDetails(formGroup: FormGroup, details) {
    if (details.studio) {
      return this.addItemStudioDetails(formGroup, details);
    } else if (details.comment) {
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
    if (details === null){
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

  printOrderDialog(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.printService.printDocument('order', id);
  }

  printReciptDialog(): void {
    this.isOrderLoading.next(true);
    const order = <IOrder>this.orderForm.value;
    console.log(order);
    this.ordersDataprovider.setRecipt(order).subscribe
    ((result) => {
      this.isOrderLoading.next(false);
      this.printService.printDocument('recipt', order.id);
    });
  }

  openCommentsPanel(order) {
    const dialogRef = this.dialog.open(OrderCommentsComponent, {
      data: order,
      width: '60%'
    });
    return dialogRef.afterClosed();
  }

  onSetOrderComments() {
    const order = this.orderForm.value;
    this.openCommentsPanel(order).subscribe((data) => {
      this.orderForm.patchValue({
        comments: data.comments,
        tags: data.tags
      });
    });
  }

  onSetOrderSketch() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.router.navigate(['orders/sketch', id]);
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
      return this.orderDoc.update(order).then((doc) => {
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
