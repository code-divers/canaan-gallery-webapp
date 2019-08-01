import { TestBed } from '@angular/core/testing';

import { OrdersDataProviderService } from './orders-data-provider.service';

describe('OrdersDataProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdersDataProviderService = TestBed.get(OrdersDataProviderService);
    expect(service).toBeTruthy();
  });
});
