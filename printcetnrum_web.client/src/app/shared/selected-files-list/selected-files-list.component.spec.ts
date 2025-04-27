import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectedFilesListComponent } from './selected-files-list.component';
import { UserFile } from '../../models/user-models/user-file';
import { By } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

describe('SelectedFilesListComponent', () => {
  let component: SelectedFilesListComponent;
  let fixture: ComponentFixture<SelectedFilesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectedFilesListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SelectedFilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display file thumbnail if file is an image', () => {
    const file: UserFile = {
      id: 1,
      fileName: 'test-image.jpg',
      fileUinique: 'test-unique',
      filePath: 'path/to/image.jpg',
      extension: '.jpg',
      uploadDate: new Date(),
      shouldPrint: false,
      isStamp: false,
      isDiploma: false
    };
    component.selectedFiles = [file];
    fixture.detectChanges();

    const fileThumbnail = component.getFileThumbnail(file);
    expect(fileThumbnail).toBe(environment.apiUrl + file.filePath);
  });

  it('should return null for file thumbnail if file is not an image', () => {
    const file: UserFile = {
      id: 2,
      fileName: 'test-document.pdf',
      fileUinique: 'test-unique',
      filePath: 'path/to/document.pdf',
      extension: '.pdf',
      uploadDate: new Date(),
      shouldPrint: false,
      isStamp: false,
      isDiploma: false
    };
    component.selectedFiles = [file];
    fixture.detectChanges();

    const fileThumbnail = component.getFileThumbnail(file);
    expect(fileThumbnail).toBeNull();
  });

  it('should return true if file is an image', () => {
    const isImage = component.isImage('.jpg');
    expect(isImage).toBeTrue();
  });

  it('should return false if file is not an image', () => {
    const isImage = component.isImage('.pdf');
    expect(isImage).toBeFalse();
  });

  it('should truncate file name if it exceeds max length', () => {
    const fileName = 'VeryLongFileNameThatExceedsMaxLength.pdf';
    const truncatedName = component.truncateFileName(fileName, 20);
    expect(truncatedName).toBe('VeryLongFileName...');
  });

  it('should return full file name if it does not exceed max length', () => {
    const fileName = 'ShortFileName.pdf';
    const truncatedName = component.truncateFileName(fileName, 20);
    expect(truncatedName).toBe(fileName);
  });

  it('should render the list of selected files', () => {
    const file: UserFile = {
      id: 1,
      fileName: 'test-image.jpg',
      fileUinique: 'test-unique',
      filePath: 'path/to/image.jpg',
      extension: '.jpg',
      uploadDate: new Date(),
      shouldPrint: false,
      isStamp: false,
      isDiploma: false
    };
    component.selectedFiles = [file];
    fixture.detectChanges();

    const fileItem = fixture.debugElement.query(By.css('.file-item'));
    expect(fileItem).toBeTruthy();
  });
});
