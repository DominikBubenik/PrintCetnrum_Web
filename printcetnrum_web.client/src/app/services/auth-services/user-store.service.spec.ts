import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserStoreService } from './user-store.service';

describe('UserStoreService', () => {
  let service: UserStoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserStoreService]
    });
    service = TestBed.inject(UserStoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRoleFromStore', () => {
    it('should return the role from the store', (done) => {
      const mockRole = 'Admin';
      service.setRoleForStore(mockRole);

      service.getRoleFromStore().subscribe(role => {
        expect(role).toBe(mockRole);
        done();
      });
    });
  });

  describe('getFullNameFromStore', () => {
    it('should return the full name from the store', () => {
      const mockFullName = 'John Doe';
      service.setFullNameForStore(mockFullName);

      const fullName = service.getFullNameFromStore();
      expect(fullName).toBe(mockFullName);
    });
  });

  describe('getFullNameFromStoreObservable', () => {
    it('should return the full name as an observable', (done) => {
      const mockFullName = 'John Doe';
      service.setFullNameForStore(mockFullName);

      service.getFullNameFromStoreObservable().subscribe(fullName => {
        expect(fullName).toBe(mockFullName);
        done();
      });
    });
  });

  describe('updateUser', () => {
    it('should update user and return response', () => {
      const userId = 1;
      const updatedUser = { name: 'Updated Name' };
      const mockResponse = { success: true };

      service.updateUser(userId, updatedUser).subscribe(response => {
        expect(response.success).toBeTrue();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/User/update/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedUser);
      req.flush(mockResponse);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return response', () => {
      const userId = 1;
      const mockResponse = { success: true };

      service.deleteUser(userId).subscribe(response => {
        expect(response.success).toBeTrue();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/User/delete/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
