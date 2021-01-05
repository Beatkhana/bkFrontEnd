import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBadgeComponent } from './create-badge.component';

describe('CreateBadgeComponent', () => {
  let component: CreateBadgeComponent;
  let fixture: ComponentFixture<CreateBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
