import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Testinomials } from './testinomials';

describe('Testinomials', () => {
  let component: Testinomials;
  let fixture: ComponentFixture<Testinomials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testinomials]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Testinomials);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
