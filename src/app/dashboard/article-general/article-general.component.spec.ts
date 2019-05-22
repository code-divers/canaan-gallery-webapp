import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleGeneralComponent } from './article-general.component';

describe('ArticleGeneralComponent', () => {
  let component: ArticleGeneralComponent;
  let fixture: ComponentFixture<ArticleGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
