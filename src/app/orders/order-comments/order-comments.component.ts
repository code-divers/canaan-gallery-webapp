import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IOrder } from '../../order-interface';

@Component({
  selector: 'order-comments',
  templateUrl: './order-comments.component.html',
  styleUrls: ['./order-comments.component.scss']
})
export class OrderCommentsComponent implements OnInit {
  public orderCommentsForm: FormGroup;
  public order: IOrder;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder
  ) {
    this.order = data;
  }

  ngOnInit() {
    this.orderCommentsForm = this.fb.group({
      comment: [this.order.comments.comment]
    });
  }

  onClose() {
    return this.orderCommentsForm.value;
  }

}
