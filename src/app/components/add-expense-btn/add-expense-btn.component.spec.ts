import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpenseBtnComponent } from './add-expense-btn.component';

describe('AddExpenseBtnComponent', () => {
  let component: AddExpenseBtnComponent;
  let fixture: ComponentFixture<AddExpenseBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExpenseBtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddExpenseBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
