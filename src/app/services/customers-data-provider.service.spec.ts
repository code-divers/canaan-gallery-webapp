import { TestBed } from '@angular/core/testing';

import { CustomersDataProviderService } from './customers-data-provider.service';

describe('CustomersDataProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomersDataProviderService = TestBed.get(CustomersDataProviderService);
    expect(service).toBeTruthy();
  });
});
