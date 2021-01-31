import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayControllerComponent } from './overlay-controller.component';

describe('OverlayControllerComponent', () => {
  let component: OverlayControllerComponent;
  let fixture: ComponentFixture<OverlayControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverlayControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
