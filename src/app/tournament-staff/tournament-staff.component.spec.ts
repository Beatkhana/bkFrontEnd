import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentStaffComponent } from './tournament-staff.component';

describe('TournamentStaffComponent', () => {
  let component: TournamentStaffComponent;
  let fixture: ComponentFixture<TournamentStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
