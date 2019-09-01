import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerLeadComponent } from './customer-lead.component';

describe('CustomerLeadComponent', () => {
  let component: CustomerLeadComponent;
  let fixture: ComponentFixture<CustomerLeadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerLeadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
