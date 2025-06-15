import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service.ts.service';
import { Firestore, doc, updateDoc, deleteDoc, getDoc, Timestamp, onSnapshot, collection, query, where, orderBy } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, Unsubscribe } from '@angular/fire/auth';

@Component({
  selector: 'app-all-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  templateUrl: './all-transactions.component.html',
  styleUrl: './all-transactions.component.css',
})
export class AllTransactionsComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private unsubscribeAuth: Unsubscribe | undefined;
  private unsubscribeTransactions: Unsubscribe | undefined;
  private unsubscribeUser: Unsubscribe | undefined;

  transactions: { docId: string; data: Expense }[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalSpent: number | undefined;
  balance: number | undefined;

  selectedDocId: string | null = null;
  editDescription = '';
  editAmount = 0;
  originalAmount = 0;

  searchQuery = '';
  filteredTransactions: { docId: string; data: Expense }[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    console.log('Component initialized');
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      if (user) {
        this.setupTransactionsListener(user.uid);
        this.setupUserListener(user.uid);
      } else {
        console.log('No user logged in');
        this.transactions = [];
        this.balance = undefined;
        this.totalSpent = undefined;
      }
    });
  }

  private setupTransactionsListener(userId: string) {
    console.log('Setting up transactions listener for user:', userId);
    const expensesRef = collection(this.firestore, 'expenses');
    const q = query(
      expensesRef,
      where('uId', '==', userId)
    );

    this.unsubscribeTransactions = onSnapshot(q, (snapshot) => {
      console.log('Received transactions snapshot:', snapshot.docs.length, 'documents');
      this.transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Transaction data:', { id: doc.id, ...data });
        return {
          docId: doc.id,
          data: {
            ...data as Expense,
            date: data['date']
          }
        };
      }).sort((a, b) => {
        // Sort in memory by date in descending order
        const dateA = this.getDateFromTimestamp(a.data.date);
        const dateB = this.getDateFromTimestamp(b.data.date);
        return dateB.getTime() - dateA.getTime();
      });

      // Initialize filtered transactions
      this.filteredTransactions = [...this.transactions];

      // Calculate total spent
      this.totalSpent = this.transactions.reduce((sum, tx) => sum + Math.abs(tx.data.amount), 0);
      console.log('Updated transactions array:', this.transactions);
      console.log('Total spent:', this.totalSpent);
    }, (error) => {
      console.error('Error fetching transactions:', error);
    });
  }

  private setupUserListener(userId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    this.unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.balance = data['balance'] || 0;
      }
    }, (error) => {
      console.error('Error fetching user data:', error);
    });
  }

  ngOnDestroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.unsubscribeTransactions) {
      this.unsubscribeTransactions();
    }
    if (this.unsubscribeUser) {
      this.unsubscribeUser();
    }
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.filteredTransactions = [...this.transactions];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredTransactions = this.transactions.filter(tx =>
      tx.data.description.toLowerCase().includes(query) ||
      tx.data.category.toLowerCase().includes(query)
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filteredTransactions = [...this.transactions];
  }

  get paginatedTransactions() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  formatAmount(amount: number): string {
    return `- $${Math.abs(amount).toFixed(2)}`;
  }

  getDateFromTimestamp(timestamp: Timestamp | Date | string): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date(timestamp);
  }

  edit(tx: { docId: string; data: Expense }) {
    this.selectedDocId = tx.docId;
    this.editDescription = tx.data.description;
    this.editAmount = tx.data.amount;
    this.originalAmount = tx.data.amount;
  }

  cancelEdit() {
    this.selectedDocId = null;
  }

  async saveEdit(docId: string) {
    const user = this.auth.currentUser;
    if (!user || this.balance === undefined) return;

    const oldTx = this.transactions.find(t => t.docId === docId);
    if (!oldTx) return;

    const difference = this.editAmount - this.originalAmount;

    // Update the expense
    const docRef = doc(this.firestore, 'expenses', docId);
    await updateDoc(docRef, {
      description: this.editDescription,
      amount: this.editAmount
    });

    // Update balance
    const userRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userRef, {
      //update helmy
      balance: this.balance + difference
    });

    this.selectedDocId = null;
  }

  async deleteExpense(docId: string, amount: number) {
    const user = this.auth.currentUser;
    if (!user || this.balance === undefined) return;

    // Delete expense
    await deleteDoc(doc(this.firestore, 'expenses', docId));

    // Add amount back to balance
    const userRef = doc(this.firestore, 'users', user.uid);
    await updateDoc(userRef, {
  balance: this.balance + Math.abs(amount)
});


    this.selectedDocId = null;
  }

///======================
// Chatbot variables
isOpen = false;
messages: { role: string; content: string }[] = [];
userInput = '';
loading = false;

commonQuestions = [
  'How can I manage my spending better?',
  'What’s the best way to budget?',
  'Give me tips to save more money.',
  'How can I stop unnecessary expenses?',
];

sendCommonQuestion(question: string) {
  this.userInput = question;
  this.sendMessage();
}

async sendMessage() {
  if (!this.userInput.trim()) return;

  const userMsg = { role: 'USER', content: this.userInput };
  this.messages.push(userMsg);
  this.userInput = '';
  this.loading = true;

  try {
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer djwltfUdLPlDovgZIcbHkBEjLEokWqW3xCXW8zDg', // Replace this with your key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: userMsg.content,
        chat_history: this.messages.map(m => ({
          role: m.role,
          message: m.content,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.text) {
      throw new Error(data.message || 'Chat failed');
    }

    this.messages.push({ role: 'CHATBOT', content: data.text.trim() });
  } catch (err: any) {
    const errorMsg =
      err?.message || (typeof err === 'object' ? JSON.stringify(err) : 'Unknown error');
    this.messages.push({ role: 'CHATBOT', content: '❌ ' + errorMsg });
  } finally {
    this.loading = false;
  }
}



}
