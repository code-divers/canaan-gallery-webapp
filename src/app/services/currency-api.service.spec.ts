import { TestBed } from '@angular/core/testing';

import { CurrencyApiService } from './currency-api.service';

describe('CurrencyApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurrencyApiService = TestBed.get(CurrencyApiService);
    expect(service).toBeTruthy();
  });
});
