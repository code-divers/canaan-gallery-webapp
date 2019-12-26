import { TestBed } from '@angular/core/testing';

import { TagsDataProviderService } from './tags-data-provider.service';

describe('TagsDataProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TagsDataProviderService = TestBed.get(TagsDataProviderService);
    expect(service).toBeTruthy();
  });
});
