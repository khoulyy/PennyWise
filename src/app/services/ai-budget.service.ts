import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, Timestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AiBudgetService {
  // 🔐 Make sure to REMOVE spaces and secure this in environment.ts
  private cohereApiKey = 'djwltfUdLPlDovgZIcbHkBEjLEokWqW3xCXW8zDg';

  constructor(private firestore: Firestore) {}

  async fetchUserExpenses(uId: string): Promise<{ [category: string]: number[] }> {
    const expensesRef = collection(this.firestore, 'expenses');
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
    const startDate = Timestamp.fromDate(threeMonthsAgo);

    const q = query(
      expensesRef,
      where('uId', '==', uId),
      where('date', '>=', startDate)
    );
    const snap = await getDocs(q);

    const categorized: { [category: string]: { [month: string]: number } } = {};

    snap.forEach((doc) => {
      const data = doc.data();
      const date = data['date'].toDate();
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const cat = data['category'];
      const amount = data['amount'];

      if (!categorized[cat]) categorized[cat] = {};
      if (!categorized[cat][monthKey]) categorized[cat][monthKey] = 0;
      categorized[cat][monthKey] += amount;
    });

    const final: { [category: string]: number[] } = {};
    for (const cat in categorized) {
      final[cat] = Object.values(categorized[cat]);
    }

    return final;
  }

  private formatForPrompt(expenseData: { [category: string]: number[] }): string {
    return Object.entries(expenseData)
      .map(([cat, amounts]) => `${cat}: ${amounts.join(', ')}`)
      .join('\n');
  }

  async getBudgetAdviceFromAI(expenseData: { [category: string]: number[] }): Promise<string> {
const prompt = `
The user has the following expense summary for the past 3 months:

${this.formatForPrompt(expenseData)}

Give a short summary with a budget cap for each category in simple words. Only return 1 sentence per category.

`;


    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cohereApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_history: [],
          message: prompt,
          connectors: [],
          model: 'command-r',
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error('Failed to fetch from Cohere');

      const result = await res.json();
      return result.text;
    } catch (err) {
      console.error('AI API failed:', err);
      return '⚠️ Unable to fetch smart suggestions at the moment. Please try again later.';
    }
  }
}
