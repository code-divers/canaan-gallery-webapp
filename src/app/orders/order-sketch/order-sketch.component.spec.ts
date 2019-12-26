import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSketchComponent } from './order-sketch.component';

describe('OrderSketchComponent', () => {
  let component: OrderSketchComponent;
  let fixture: ComponentFixture<OrderSketchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSketchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSketchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
