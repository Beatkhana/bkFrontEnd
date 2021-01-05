import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Awards2020Component } from './awards2020.component';

describe('Awards2020Component', () => {
  let component: Awards2020Component;
  let fixture: ComponentFixture<Awards2020Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Awards2020Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Awards2020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
