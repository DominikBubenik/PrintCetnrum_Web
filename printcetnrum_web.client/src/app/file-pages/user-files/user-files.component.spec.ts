import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFilesComponent } from './user-files.component';
import { FileHandlerService } from '../../services/file-services/file-handler.service';
import { DesignFilesHandlerService } from '../../services/file-services/design-files-handler.service';
import { AuthService } from '../../services/auth-services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UserFile } from '../../models/user-models/user-file';

describe('UserFilesComponent', () => {
  let component: UserFilesComponent;
  let fixture: ComponentFixture<UserFilesComponent>;

  const mockFileHandlerService = {
    fetchFiles: jasmine.createSpy('fetchFiles').and.returnValue(of([])),
    markForPrint: jasmine.createSpy('markForPrint').and.returnValue(of(null)),
    deleteFile: jasmine.createSpy('deleteFile').and.returnValue(of(null))
  };

  const mockDesignService = {
    getUserStamps: jasmine.createSpy('getUserStamps').and.returnValue(of([])),
    getUserDiplomas: jasmine.createSpy('getUserDiplomas').and.returnValue(of([])),
    deleteDesignFile: jasmine.createSpy('deleteDesignFile').and.returnValue(of(null))
  };

  const mockAuthService = {
    isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true)
  };

  const mockModalService = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll')
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFilesComponent],
      providers: [
        { provide: FileHandlerService, useValue: mockFileHandlerService },
        { provide: DesignFilesHandlerService, useValue: mockDesignService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch files on init when logged in', () => {
    expect(mockFileHandlerService.fetchFiles).toHaveBeenCalled();
    expect(mockDesignService.getUserStamps).toHaveBeenCalled();
    expect(mockDesignService.getUserDiplomas).toHaveBeenCalled();
  });

  it('should mark a file for print', () => {
    component.markForPrint({ id: 1, shouldPrint: true, isFile: true });
    expect(mockFileHandlerService.markForPrint).toHaveBeenCalledWith(1, true, true);
  });

  it('should open delete modal and set file to delete', () => {
    const dummyFile = {} as UserFile;
    component.openDeleteModal(dummyFile, {});
    expect(component.fileToDelete).toBe(dummyFile);
    expect(mockModalService.open).toHaveBeenCalled();
  });

  it('should confirm and delete a normal file', () => {
    component.fileToDelete = { id: 1, isDiploma: false, isStamp: false } as UserFile;
    component.confirmDelete();
    expect(mockFileHandlerService.deleteFile).toHaveBeenCalledWith(1);
  });

  it('should confirm and delete a design file', () => {
    component.fileToDelete = { id: 2, isDiploma: true, isStamp: false } as UserFile;
    component.confirmDelete();
    expect(mockDesignService.deleteDesignFile).toHaveBeenCalledWith(2);
  });

  it('should sort files by name', () => {
    component.files = [
      { fileName: 'Zeta', uploadDate: new Date() } as UserFile,
      { fileName: 'Alpha', uploadDate: new Date() } as UserFile
    ];
    component.sortFiles('name');
    expect(component.files[0].fileName).toBe('Alpha');
  });
});
