import { TestBed } from '@angular/core/testing';

import { DesignFilesHandlerService } from './design-files-handler.service';

describe('DesignFilesHandlerService', () => {
  let service: DesignFilesHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesignFilesHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
