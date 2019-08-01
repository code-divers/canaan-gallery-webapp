import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GiphyApiService, IGiphy } from '../../services/giphy-api.service';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit {
  public item;
  public specialItemForm: FormGroup;
  public simpleItemForm: FormGroup;
  public giphies: Observable<IGiphy[]>;
  giphiesFilter: BehaviorSubject<string|null> = new BehaviorSubject(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private giphy: GiphyApiService
  ) { }

  ngOnInit() {
    this.item = this.data;
    this.simpleItemForm = this.fb.group({
      comment: [this.item.details.comment ? this.item.details.comment : null]
    });
    this.specialItemForm = this.fb.group({
      studio: this.fb.group({
        atara: [this.item.details.studio ? this.item.details.studio.atara : null],
        corners: this.fb.group({
          topRight: [this.item.details.studio ? this.item.details.studio.corners.topRight : null],
          topLeft: [this.item.details.studio ? this.item.details.studio.corners.topLeft : null],
          bottomRight: [this.item.details.studio ? this.item.details.studio.corners.bottomRight : null],
          bottomLeft: [this.item.details.studio ? this.item.details.studio.corners.bottomLeft : null]
        })
      })
    });
  }

  onSubmit(){

  }

  onClose() {
    if (this.item.group === environment.studioGroup) {
      return this.specialItemForm.value;
    } else {
      return this.simpleItemForm.value;
    }
  }

}
