import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDataClientComponent } from './view-data-client.component';

describe('ViewDataClientComponent', () => {
  let component: ViewDataClientComponent;
  let fixture: ComponentFixture<ViewDataClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewDataClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDataClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
