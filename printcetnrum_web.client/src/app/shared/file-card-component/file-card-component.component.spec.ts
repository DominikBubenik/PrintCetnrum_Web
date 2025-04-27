import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileCardComponentComponent } from './file-card-component.component';
import { UserFile } from '../../models/user-models/user-file';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('FileCardComponentComponent', () => {
  let component: FileCardComponentComponent;
  let fixture: ComponentFixture<FileCardComponentComponent>;
  let editButton: DebugElement;
  let deleteButton: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileCardComponentComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FileCardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct file title', () => {
    component.title = 'Test File';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.file-card-title');
    expect(title.textContent).toBe('Test File');
  });

  it('should call markForPrint when markFile is called', () => {
    const file: UserFile = {
      id: 1,
      fileName: 'Test.pdf',
      fileUinique: 'test-unique',
      filePath: 'path',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: false,
      isStamp: false,
      isDiploma: false
    };
    spyOn(component.markForPrint, 'emit');

    component.markFile(file);
    expect(component.markForPrint.emit).toHaveBeenCalledWith({ id: file.id, shouldPrint: true, isFile: true });
  });

  it('should call editFile when edit button is clicked', () => {
    const fileId = 1;
    spyOn(component.editFile, 'emit');

    editButton = fixture.debugElement.query(By.css('.edit-btn'));
    editButton.nativeElement.click();

    expect(component.editFile.emit).toHaveBeenCalledWith(fileId);
  });

  it('should call openDeleteModal when delete button is clicked', () => {
    const file: UserFile = {
      id: 1,
      fileName: 'Test.pdf',
      fileUinique: 'test-unique',
      filePath: 'path',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: false,
      isStamp: false,
      isDiploma: false
    };
    spyOn(component.openDeleteModal, 'emit');

    deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
    deleteButton.nativeElement.click();

    expect(component.openDeleteModal.emit).toHaveBeenCalledWith(file);
  });

  it('should return true if file is an image', () => {
    const isImage = component.isImage('.jpg');
    expect(isImage).toBeTrue();
  });

  it('should return false if file is not an image', () => {
    const isImage = component.isImage('.pdf');
    expect(isImage).toBeFalse();
  });

  it('should return true if file is of unknown type', () => {
    const isUnknownType = component.isUnknownType('.txt');
    expect(isUnknownType).toBeTrue();
  });

  it('should return false if file is of a known type', () => {
    const isUnknownType = component.isUnknownType('.pdf');
    expect(isUnknownType).toBeFalse();
  });

  it('should return true if file is selected', () => {
    const selectedFile: UserFile = {
      id: 1,
      fileName: 'Test.pdf',
      fileUinique: 'test-unique',
      filePath: 'path',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: false,
      isStamp: false,
      isDiploma: false
    };
    component.selectedFiles = [selectedFile];

    const isSelected = component.isFileSelected(selectedFile);
    expect(isSelected).toBeTrue();
  });

  it('should return false if file is not selected', () => {
    const selectedFile: UserFile = {
      id: 1,
      fileName: 'Test.pdf',
      fileUinique: 'test-unique',
      filePath: 'path',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: false,
      isStamp: false,
      isDiploma: false
    };
    component.selectedFiles = [];

    const isSelected = component.isFileSelected(selectedFile);
    expect(isSelected).toBeFalse();
  });
});
