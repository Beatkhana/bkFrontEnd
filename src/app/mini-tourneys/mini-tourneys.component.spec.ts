import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniTourneysComponent } from './mini-tourneys.component';

describe('MiniTourneysComponent', () => {
  let component: MiniTourneysComponent;
  let fixture: ComponentFixture<MiniTourneysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiniTourneysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniTourneysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
