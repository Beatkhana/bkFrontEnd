import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBracketMatchComponent } from './edit-bracket-match.component';

describe('EditBracketMatchComponent', () => {
  let component: EditBracketMatchComponent;
  let fixture: ComponentFixture<EditBracketMatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBracketMatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBracketMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
