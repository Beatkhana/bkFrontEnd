import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignBadgesComponent } from './assign-badges.component';

describe('AssignBadgesComponent', () => {
  let component: AssignBadgesComponent;
  let fixture: ComponentFixture<AssignBadgesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignBadgesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
