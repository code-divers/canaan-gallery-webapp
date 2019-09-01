import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ICustomer } from 'src/app/order-interface';

export interface ILead {
  id: number;
  name: string;
  email: string;
  phone: string;
  comments: string;
}

@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirmation-dialog.html',
  styleUrls: ['./customer-lead.component.scss']
})
export class ConfirmationDialogComponent {
  customer: ILead;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ILead) {
      this.customer = data;
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}

@Component({
  selector: 'customer-lead',
  templateUrl: './customer-lead.component.html',
  styleUrls: ['./customer-lead.component.scss']
})
export class CustomerLeadComponent implements OnInit {
  customerForm: FormGroup;
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private fb: FormBuilder,
    private fns: AngularFireFunctions,
    private readonly afs: AngularFirestore,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.customerForm = this.fb.group({
      id: [null],
      name: [],
      email: [],
      phone: [],
      comments: []
    });
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading.next(true);
      const orderDoc = this.afs.doc<ICustomer>(`customers/${id}`);
      const order = orderDoc.valueChanges().subscribe(customer => {
        this.customerForm.patchValue(customer);
        this.isLoading.next(false);
      });
    }
  }

  notIsloading() {
    return this.isLoading.pipe(map(value => {
      return !value;
    }));
  }

  clearForm() {
    this.customerForm.reset();
  }

  onSubmit(){
    this.isLoading.next(true);
    const customer = this.customerForm.value;
    console.log(customer);
    const callable = this.fns.httpsCallable('setCustomer');
    return callable(customer).pipe(catchError((err) => {
      this.snackBar.open('Failed save customer. Please try again', 'ok', {
        duration: 5000
       });
       this.isLoading.next(false);
       return of(err);
    })).subscribe((result) => {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if (id) {
        return this.router.navigate(['customers/list']);
      }
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '60%',
        data: result
      });
      dialogRef.afterClosed().subscribe(() => {
        this.isLoading.next(false);
        this.clearForm();
      });
    });
  }

}

