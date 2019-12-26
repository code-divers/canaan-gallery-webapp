import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { IOrder, ITag } from '../../order-interface';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { TagsDataProviderService } from '../../services/tags-data-provider.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';

@Component({
  selector: 'order-comments',
  templateUrl: './order-comments.component.html',
  styleUrls: ['./order-comments.component.scss']
})
export class OrderCommentsComponent implements OnInit {
  public orderCommentsForm: FormGroup;
  public order: IOrder;
  tags: Observable<ITag[]>;
  tagsCtrl = new FormControl();
  selectedTags: ITag[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagsInput') tagsInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private tagsDataProvider: TagsDataProviderService
  ) {
    this.order = data;
  }

  ngOnInit() {
    this.tags = this.tagsDataProvider.fetchTags();
    this.orderCommentsForm = this.fb.group({
      comments: [this.order.comments],
      tags: [this.order.tags || []]
    });
  }

  onClose() {
    return this.orderCommentsForm.value;
  }

  addTag(event: MatChipInputEvent){
    console.log(event);
  }

  removeTag(tag: string): void {
    const tags = this.orderCommentsForm.get('tags').value;
    const index = tags.indexOf(tag);

    if (index >= 0) {
      console.log(tags.splice(index, 1));
      this.orderCommentsForm.patchValue({
        tags: tags.splice(index, 1)
      });
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    this.orderCommentsForm.get('tags').value.push(event.option.viewValue);
    this.tagsInput.nativeElement.value = '';
    this.tagsCtrl.setValue(null);
  }

}
