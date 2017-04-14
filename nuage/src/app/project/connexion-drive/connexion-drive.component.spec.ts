import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnexionDriveComponent } from './connexion-drive.component';

describe('ConnexionDriveComponent', () => {
  let component: ConnexionDriveComponent;
  let fixture: ComponentFixture<ConnexionDriveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnexionDriveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnexionDriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
