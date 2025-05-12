import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrUserComponent } from './admin-or-user.component';

describe('AdminOrUserComponent', () => {
  let component: AdminOrUserComponent;
  let fixture: ComponentFixture<AdminOrUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
