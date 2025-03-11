import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralTextComponent } from './general-text.component';

describe('GeneralTextComponent', () => {
  let component: GeneralTextComponent;
  let fixture: ComponentFixture<GeneralTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneralTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
