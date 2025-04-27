import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DesignFilesHandlerService } from './design-files-handler.service';
import { AuthService } from '../auth-services/auth.service';

describe('DesignFilesHandlerService', () => {
  let service: DesignFilesHandlerService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getfullNameFromToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DesignFilesHandlerService,
        { provide: AuthService, useValue: authSpy }
      ]
    });
    service = TestBed.inject(DesignFilesHandlerService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadDesignFile', () => {
    it('should upload the design file and return a response', () => {
      const file = new File(['dummy content'], 'dummyFile.txt');
      const fileName = 'dummyFile.txt';
      const fileId = 123;
      const type = 'Diploma';
      const mockResponse = { success: true };

      authService.getfullNameFromToken.and.returnValue('John Doe');

      service.uploadDesignFile(file, fileName, fileId, type).subscribe(response => {
        expect(response.success).toBeTrue();
      });

      const req = httpMock.expectOne('https://localhost:7074/api/DesignFile/uploadDesignFile');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.has('designFile')).toBeTrue();
      expect(req.request.body.get('userName')).toBe('John Doe');
      expect(req.request.body.get('fileName')).toBe(fileName);
      expect(req.request.body.get('fileId')).toBe(fileId.toString());
      expect(req.request.body.get('type')).toBe(type);
      req.flush(mockResponse);
    });
  });

  describe('getUserDiplomas', () => {
    it('should return a list of user diplomas', () => {
      const mockDiplomas = [{ id: 1, name: 'Diploma 1' }, { id: 2, name: 'Diploma 2' }];
      authService.getfullNameFromToken.and.returnValue('John Doe');

      service.getUserDiplomas().subscribe(diplomas => {
        expect(diplomas.length).toBe(2);
        expect(diplomas[0].fileName).toBe('Diploma 1');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/DesignFile/getUserDesignFiles?userName=John%20Doe&type=Diploma');
      expect(req.request.method).toBe('GET');
      req.flush(mockDiplomas);
    });
  });

  describe('getUserStamps', () => {
    it('should return a list of user stamps', () => {
      const mockStamps = [{ id: 1, name: 'Stamp 1' }, { id: 2, name: 'Stamp 2' }];
      authService.getfullNameFromToken.and.returnValue('John Doe');

      service.getUserStamps().subscribe(stamps => {
        expect(stamps.length).toBe(2);
        expect(stamps[0].fileName).toBe('Stamp 1');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/DesignFile/getUserDesignFiles?userName=John%20Doe&type=Stamp');
      expect(req.request.method).toBe('GET');
      req.flush(mockStamps);
    });
  });

  describe('deleteDesignFile', () => {
    it('should delete the design file and return a response', () => {
      const fileId = 123;
      const mockResponse = {};

      service.deleteDesignFile(fileId).subscribe(response => {
        expect(response).toEqual();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/DesignFile/deleteDesignFile/${fileId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('downloadDesignFile', () => {
    it('should download the design file as a blob', () => {
      const fileId = 123;
      const mockBlob = new Blob(['dummy content'], { type: 'application/octet-stream' });

      service.downloadDesignFile(fileId).subscribe(blob => {
        expect(blob).toBeTruthy();
      });

      const req = httpMock.expectOne(`https://localhost:7074/api/DesignFile/downloadDesignFile/${fileId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBlob);
    });
  });

  describe('getDesignFileById', () => {
    it('should return the design file as a blob', () => {
      const fileId = 123;
      const mockBlob = new Blob(['dummy content'], { type: 'application/octet-stream' });

      service.getDesignFileById(fileId).subscribe(blob => {
        expect(blob).toBeTruthy();
      });

      const req = httpMock.expectOne('https://localhost:7074/api/DesignFile/getDesignFileWithId');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(fileId);
      req.flush(mockBlob);
    });
  });

  describe('getDesignFilesById', () => {
    it('should return a list of design files by their ids', () => {
      const fileIds = [123, 456];
      const mockFiles = [{ id: 123, name: 'File 1' }, { id: 456, name: 'File 2' }];

      service.getDesignFilesById(fileIds).subscribe(files => {
        expect(files.length).toBe(2);
        expect(files[0].name).toBe('File 1');
      });

      const req = httpMock.expectOne('https://localhost:7074/api/DesignFile/getDesignFilesWithId');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(fileIds);
      req.flush(mockFiles);
    });
  });
});
