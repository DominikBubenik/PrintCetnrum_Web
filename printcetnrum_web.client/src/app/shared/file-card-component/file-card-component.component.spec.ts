import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileCardComponentComponent } from './file-card-component.component';

describe('FileCardComponentComponent', () => {
  let component: FileCardComponentComponent;
  let fixture: ComponentFixture<FileCardComponentComponent>;

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
});
