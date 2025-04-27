import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;
  let confirmButton: DebugElement;
  let cancelButton: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and message', () => {
    component.title = 'Test Title';
    component.message = 'Test Message';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.modal-title');
    const message = fixture.nativeElement.querySelector('.modal-message');

    expect(title.textContent).toBe('Test Title');
    expect(message.textContent).toBe('Test Message');
  });

  it('should show confirm and cancel buttons with correct texts', () => {
    component.confirmButtonText = 'Proceed';
    component.isVisible = true;
    fixture.detectChanges();

    confirmButton = fixture.debugElement.query(By.css('.confirm-btn'));
    cancelButton = fixture.debugElement.query(By.css('.cancel-btn'));

    expect(confirmButton.nativeElement.textContent).toBe('Proceed');
    expect(cancelButton.nativeElement.textContent).toBe('Cancel');
  });

  it('should emit confirmed when confirm button is clicked', () => {
    spyOn(component.confirmed, 'emit');

    component.isVisible = true;
    fixture.detectChanges();

    confirmButton = fixture.debugElement.query(By.css('.confirm-btn'));
    confirmButton.nativeElement.click();

    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('should emit canceled when cancel button is clicked', () => {
    spyOn(component.canceled, 'emit');

    component.isVisible = true;
    fixture.detectChanges();

    cancelButton = fixture.debugElement.query(By.css('.cancel-btn'));
    cancelButton.nativeElement.click();

    expect(component.canceled.emit).toHaveBeenCalled();
  });

  it('should not display modal when isVisible is false', () => {
    component.isVisible = false;
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeNull();
  });

  it('should display modal when isVisible is true', () => {
    component.isVisible = true;
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).not.toBeNull();
  });
});
