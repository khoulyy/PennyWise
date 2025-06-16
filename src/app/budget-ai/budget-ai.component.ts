import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 import this
import { Auth } from '@angular/fire/auth';
import { AiBudgetService } from '../services/ai-budget.service';

@Component({
  selector: 'app-budget-ai',
  standalone: true,
  imports: [CommonModule], // ✅ add here
  templateUrl: './budget-ai.component.html',
  styleUrls: ['./budget-ai.component.css']
})
export class BudgetAiComponent  {
  advice: string = '';
  loading = false;

  constructor(private auth: Auth, private aiService: AiBudgetService) {}

//   async ngOnInit() {
//     const user = this.auth.currentUser;
//     if (!user) return;

//     this.loading = true;
//     const data = await this.aiService.fetchUserExpenses(user.uid);
//     try {
// this.advice = await this.aiService.getBudgetAdviceFromAI(data);
// } catch (err) {
//   this.advice = 'Unable to load budget suggestions. Please try again shortly.';
//   console.error(err);
// }

//     this.loading = false;
//   }


  async generateAdvice() {
    const user = this.auth.currentUser;
    if (!user) {
      this.advice = 'User not authenticated.';
      return;
    }

    this.loading = true;
    try {
      const data = await this.aiService.fetchUserExpenses(user.uid);
      this.advice = await this.aiService.getBudgetAdviceFromAI(data);
    } catch (err) {
      console.error('AI Budget Error:', err);
      this.advice = '⚠️ Unable to fetch smart suggestions at the moment.';
    }
    this.loading = false;
  }
}
