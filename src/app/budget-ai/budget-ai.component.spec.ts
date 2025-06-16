import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetAiComponent } from './budget-ai.component';

describe('BudgetAiComponent', () => {
  let component: BudgetAiComponent;
  let fixture: ComponentFixture<BudgetAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetAiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BudgetAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
