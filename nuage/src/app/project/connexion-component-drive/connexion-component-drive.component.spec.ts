import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnexionComponentDriveComponent } from './connexion-component-drive.component';

describe('ConnexionComponentDriveComponent', () => {
  let component: ConnexionComponentDriveComponent;
  let fixture: ComponentFixture<ConnexionComponentDriveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnexionComponentDriveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnexionComponentDriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
