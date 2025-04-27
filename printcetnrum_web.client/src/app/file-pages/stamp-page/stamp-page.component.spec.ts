import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StampPageComponent } from './stamp-page.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DesignFilesHandlerService } from '../../services/file-services/design-files-handler.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('StampPageComponent', () => {
  let component: StampPageComponent;
  let fixture: ComponentFixture<StampPageComponent>;
  let mockDesignService: jasmine.SpyObj<DesignFilesHandlerService>;

  beforeEach(async () => {
    mockDesignService = jasmine.createSpyObj('DesignFilesHandlerService', [
      'getDesignFileById',
      'uploadDesignFile',
    ]);

    await TestBed.configureTestingModule({
      declarations: [StampPageComponent],
      imports: [MatSnackBarModule],
      providers: [
        { provide: DesignFilesHandlerService, useValue: mockDesignService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', '-1']]) } },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StampPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add a text box', () => {
    const initialLength = component.textBoxes.length;
    component.addTextBox();
    expect(component.textBoxes.length).toBe(initialLength + 1);
    expect(component.textBoxes.at(-1)?.text).toBe('New Text');
  });

  it('should delete a selected text box', () => {
    component.addTextBox();
    component.selectedIndex = 0;
    component.deleteSelectedTextBox();
    expect(component.textBoxes.length).toBe(0);
  });

  it('should select and update current font size', () => {
    component.addTextBox();
    const event = new MouseEvent('click');
    component.selectTextBox(event, 0);
    expect(component.selectedIndex).toBe(0);
    expect(component.currentSize()).toBe(20);
  });

  it('should deselect on outside click', () => {
    const mockEvent = new MouseEvent('click');
    const div = document.createElement('div');
    mockEvent.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, div);
    spyOnProperty(mockEvent, 'target').and.returnValue(div);
    component.deselectTextBox(mockEvent);
    expect(component.selectedIndex).toBeNull();
  });

  it('should increase font size', () => {
    component.addTextBox();
    component.selectedIndex = 0;
    const original = component.currentSize();
    component.increaseFontSize(new MouseEvent('click'));
    expect(component.textBoxes[0].fontSize).toBe(original + 2);
  });

  it('should decrease font size', () => {
    component.addTextBox();
    component.selectedIndex = 0;
    const original = component.currentSize();
    component.decreaseFontSize(new MouseEvent('click'));
    expect(component.textBoxes[0].fontSize).toBe(original - 2);
  });

  it('should toggle bold style', () => {
    component.addTextBox();
    component.selectedIndex = 0;
    expect(component.textBoxes[0].isBold).toBeFalse();
    component.toggleBold(new MouseEvent('click'));
    expect(component.textBoxes[0].isBold).toBeTrue();
  });

  it('should save to history and be able to undo', () => {
    component.addTextBox();
    component.saveToHistory();
    component.addTextBox();
    expect(component.textBoxes.length).toBe(2);
    component.undo();
    expect(component.textBoxes.length).toBe(1);
  });


  it('should parse a valid JSON file', (done) => {
    const validStampData = {
      stampName: 'My Stamp',
      stampType: 'Modico',
      textBoxes: [{ text: 'Sample', image: null, x: 0, y: 0, fontSize: 20, width: 100, height: 50, isBold: false }],
    };
    const file = new File([JSON.stringify(validStampData)], 'test.json', {
      type: 'application/json',
    });
    spyOn(component, 'saveToHistory');

    component.parseJson(file);
    setTimeout(() => {
      expect(component.stampName).toBe('My Stamp');
      expect(component.textBoxes.length).toBe(1);
      done();
    });
  });
});
