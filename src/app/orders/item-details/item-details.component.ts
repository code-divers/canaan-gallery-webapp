import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Product } from '../order-interface';

@Component({
  selector: 'item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit {
  public product: Product;
  itemForm: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: Product, private fb: FormBuilder) { }

  ngOnInit() {
    this.product = this.data;
    this.itemForm = this.fb.group({
      atara: [''],
      corners: this.fb.group({
        topRight: [''],
        topLeft: [''],
        bottomRight: [''],
        bottomLeft: ['']
      })
    });
  }

  onSubmit(){

  }

}
