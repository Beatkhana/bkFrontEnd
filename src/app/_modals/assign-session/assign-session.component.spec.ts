import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignSessionComponent } from './assign-session.component';

describe('AssignSessionComponent', () => {
  let component: AssignSessionComponent;
  let fixture: ComponentFixture<AssignSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
