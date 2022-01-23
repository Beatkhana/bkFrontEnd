import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Awards2021Component } from './awards2021.component';

describe('Awards2021Component', () => {
  let component: Awards2021Component;
  let fixture: ComponentFixture<Awards2021Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Awards2021Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Awards2021Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
