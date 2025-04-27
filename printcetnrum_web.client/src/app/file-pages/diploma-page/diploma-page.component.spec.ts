import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiplomaPageComponent } from './diploma-page.component';
import { ActivatedRoute } from '@angular/router';
import { DesignFilesHandlerService } from '../../services/file-services/design-files-handler.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';

describe('DiplomaPageComponent', () => {
  let component: DiplomaPageComponent;
  let fixture: ComponentFixture<DiplomaPageComponent>;
  let mockDesignService: any;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => '-1' 
      }
    }
  };

  beforeEach(async () => {
    mockDesignService = {
      getDesignFileById: jasmine.createSpy('getDesignFileById').and.returnValue(of({})),
      uploadDesignFile: jasmine.createSpy('uploadDesignFile').and.returnValue(of({ id: 123 }))
    };

    await TestBed.configureTestingModule({
      declarations: [DiplomaPageComponent],
      imports: [MatSnackBarModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DesignFilesHandlerService, useValue: mockDesignService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DiplomaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new text box', () => {
    const initialCount = component.textBoxes.length;
    component.addTextBox();
    expect(component.textBoxes.length).toBe(initialCount + 1);
    expect(component.textBoxes[0].text).toBe('New Text');
  });

  it('should delete selected text box', () => {
    component.addTextBox();
    component.selectedIndex = 0;
    component.deleteSelectedTextBox();
    expect(component.textBoxes.length).toBe(0);
    expect(component.selectedIndex).toBeNull();
  });

  it('should store state in history on saveToHistory', () => {
    component.addTextBox();
    const historyLengthBefore = component.history.length;
    component.saveToHistory();
    expect(component.history.length).toBeGreaterThan(historyLengthBefore);
  });

  it('should undo to previous state', () => {
    component.addTextBox();
    component.saveToHistory();
    const originalTextBoxes = [...component.textBoxes];
    component.addTextBox(); 
    component.undo();
    expect(component.textBoxes.length).toBe(originalTextBoxes.length);
  });

  it('should save diploma and receive id', () => {
    component.addTextBox();
    component.saveDiploma();
    expect(mockDesignService.uploadDesignFile).toHaveBeenCalled();
  });

  it('should parse valid JSON file', () => {
    const file = new File([JSON.stringify({
      diplomaName: 'Test',
      textColor: 'blue',
      boardColor: 'green',
      textBoxes: [{ text: 'Hello', x: 10, y: 10, width: 100, height: 40, color: 'blue' }]
    })], 'diploma.json', { type: 'application/json' });

    spyOn(component, 'saveToHistory');

    component.parseJson(file);
    setTimeout(() => {
      expect(component.diplomaName).toBe('Test');
      expect(component.textBoxes.length).toBe(1);
      expect(component.textColor).toBe('blue');
      expect(component.boardColor).toBe('green');
      expect(component.saveToHistory).toHaveBeenCalled();
    }, 100);
  });

  it('should set board color value correctly', () => {
    component.boardColor = 'red';
    expect(component.getBoardColorValue()).toBe('#591527');

    component.boardColor = 'unknown';
    expect(component.getBoardColorValue()).toBe('white');
  });
});
