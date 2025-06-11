import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ExpenseModalComponent } from './components/expense-modal/expense-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ExpenseModalComponent],
  template: `
    <router-outlet></router-outlet>
    <app-expense-modal></app-expense-modal>
  `
})
export class AppComponent {
  title = 'pennywise';
}
