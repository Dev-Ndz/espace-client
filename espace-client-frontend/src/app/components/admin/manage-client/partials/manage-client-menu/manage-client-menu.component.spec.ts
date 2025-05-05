import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageClientMenuComponent } from './manage-client-menu.component';

describe('ManageClientMenuComponent', () => {
  let component: ManageClientMenuComponent;
  let fixture: ComponentFixture<ManageClientMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageClientMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageClientMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
