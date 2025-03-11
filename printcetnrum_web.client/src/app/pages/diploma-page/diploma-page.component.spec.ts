import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiplomaPageComponent } from './diploma-page.component';

describe('DiplomaPageComponent', () => {
  let component: DiplomaPageComponent;
  let fixture: ComponentFixture<DiplomaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiplomaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiplomaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
