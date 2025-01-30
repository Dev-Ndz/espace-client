import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShootingInfoComponent } from './shooting-info.component';

describe('ShootingInfoComponent', () => {
  let component: ShootingInfoComponent;
  let fixture: ComponentFixture<ShootingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShootingInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShootingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
