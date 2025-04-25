import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FileHandlerService } from './file-handler.service';
import { AuthService } from '../auth-services/auth.service';
import { UserStoreService } from '../auth-services/user-store.service';

describe('FileHandlerService', () => {
  let service: FileHandlerService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let userStoreService: jasmine.SpyObj<UserStoreService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getfullNameFromToken']);
    const userStoreSpy = jasmine.createSpyObj('UserStoreService', ['getFullNameFromStore']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FileHandlerService,
        { provide: AuthService, useValue: authSpy },
        { provide: UserStoreService, useValue: userStoreSpy }
      ]
    });
    service = TestBed.inject(FileHandlerService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userStoreService = TestBed.inject(UserStoreService) as jasmine.SpyObj<UserStoreService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadFiles', () => {
    it('should upload the files and return the file paths', () => {
      const mockFiles = [new File(['dummy content'], 'dummyFile.txt')];
      const mockResponse = [{ filePath: 'path/to/file' }];
      authService.getfullNameFromToken.and.returnValue('John Doe');

      service.uploadFiles(mockFiles).subscribe(response => {
        expect(response.length).toBe(1);
        expect(response[0].filePath).toBe('path/to/file');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/Upload/uploadFiles');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.has('files')).toBeTrue();
      expect(req.request.body.get('userName')).toBe('John Doe');
      req.flush(mockResponse);
    });
  });

  describe('fetchFiles', () => {
    it('should return a list of user files', () => {
      const mockFiles = [{ id: 1, name: 'File 1' }, { id: 2, name: 'File 2' }];
      authService.getfullNameFromToken.and.returnValue('John Doe');

      service.fetchFiles().subscribe(files => {
        expect(files.length).toBe(2);
        expect(files[0].fileName).toBe('File 1');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/Upload/getUserFiles?userName=John%20Doe');
      expect(req.request.method).toBe('GET');
      req.flush(mockFiles);
    });
  });

  describe('markForPrint', () => {
    it('should update the print status of the file', () => {
      const fileId = 123;
      const shouldPrint = true;
      const isFile = true;
      const mockResponse = {};

      service.markForPrint(fileId, shouldPrint, isFile).subscribe(response => {
        expect(response).toEqual();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Upload/updatePrintStatus/${fileId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ shouldPrint, isFile });
      req.flush(mockResponse);
    });
  });

  describe('getFilesWithId', () => {
    it('should return a list of files for the given ids', () => {
      const fileIds = [123, 456];
      const mockFiles = [{ id: 123, name: 'File 1' }, { id: 456, name: 'File 2' }];

      service.getFilesWithId(fileIds).subscribe(files => {
        expect(files.length).toBe(2);
        expect(files[0].fileName).toBe('File 1');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/Upload/getFilesWithId');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(fileIds);
      req.flush(mockFiles);
    });
  });

  describe('deleteFile', () => {
    it('should delete the file and return a response', () => {
      const fileId = 123;
      const mockResponse = {};

      service.deleteFile(fileId).subscribe(response => {
        expect(response).toEqual();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Upload/deleteFile/${fileId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getFile', () => {
    it('should return the file for the given id', () => {
      const fileId = 123;
      const mockFile = { id: 123, name: 'File 1' };

      service.getFile(fileId).subscribe(file => {
        expect(file.fileName).toBe('File 1');
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Upload/getUserFile/${fileId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFile);
    });
  });

  describe('saveChanges', () => {
    it('should save the changes for the file and return a response', () => {
      const fileId = 123;
      const newFile = new File(['new content'], 'newFile.txt');
      const mockResponse = 1;

      service.saveChanges(fileId, newFile).subscribe(response => {
        expect(response).toBe(mockResponse);
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Upload/replaceFile/${fileId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.has('newFile')).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('downloadFile', () => {
    it('should download the file as a blob', () => {
      const fileId = 123;
      const mockBlob = new Blob(['dummy content'], { type: 'application/octet-stream' });

      service.downloadFile(fileId).subscribe(blob => {
        expect(blob).toBeTruthy();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/Upload/downloadFile/${fileId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBlob);
    });
  });
});
