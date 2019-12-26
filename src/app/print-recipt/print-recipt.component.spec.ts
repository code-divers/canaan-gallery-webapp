import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintReciptComponent } from './print-recipt.component';

describe('PrintReciptComponent', () => {
  let component: PrintReciptComponent;
  let fixture: ComponentFixture<PrintReciptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintReciptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintReciptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
