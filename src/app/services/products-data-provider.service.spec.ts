import { TestBed } from '@angular/core/testing';

import { ProductsDataProviderService } from './products-data-provider.service';

describe('Products.DataProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProductsDataProviderService = TestBed.get(ProductsDataProviderService);
    expect(service).toBeTruthy();
  });
});
