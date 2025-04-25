import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadFileComponent } from './upload-file.component';
import { FileHandlerService } from '../../services/file-services/file-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('UploadFileComponent', () => {
  let component: UploadFileComponent;
  let fixture: ComponentFixture<UploadFileComponent>;
  let fileHandlerServiceSpy: jasmine.SpyObj<FileHandlerService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    fileHandlerServiceSpy = jasmine.createSpyObj('FileHandlerService', ['uploadFiles']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [UploadFileComponent],
      providers: [
        { provide: FileHandlerService, useValue: fileHandlerServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update selectedFiles on file selection', () => {
    const fakeFile = new File(['content'], 'file.txt', { type: 'text/plain' });
    const event = { target: { files: [fakeFile] } };
    component.onFilesSelected(event);
    expect(component.selectedFiles.length).toBe(1);
    expect(component.selectedFiles[0]).toBe(fakeFile);
  });

  it('should not call upload if no files are selected', () => {
    component.selectedFiles = [];
    component.uploadFiles();
    expect(fileHandlerServiceSpy.uploadFiles).not.toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith('No files selected for upload.', 'Close', {
      duration: 3000,
      panelClass: ['warning-snackbar']
    });
  });

  it('should call uploadFiles and handle success', () => {
    const file = new File([''], 'test.txt');
    component.selectedFiles = [file];
    fileHandlerServiceSpy.uploadFiles.and.returnValue(of());

    component.uploadFiles();

    expect(fileHandlerServiceSpy.uploadFiles).toHaveBeenCalledWith([file]);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Upload successful!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/userFiles']);
  });

  it('should call uploadFiles and handle error', () => {
    const file = new File([''], 'error.txt');
    const errorMsg = 'Something went wrong';
    component.selectedFiles = [file];
    fileHandlerServiceSpy.uploadFiles.and.returnValue(throwError(() => ({ error: errorMsg })));

    component.uploadFiles();

    expect(fileHandlerServiceSpy.uploadFiles).toHaveBeenCalledWith([file]);
    expect(snackBarSpy.open).toHaveBeenCalledWith(errorMsg, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  });
});
