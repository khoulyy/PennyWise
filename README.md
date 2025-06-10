# Pennywise

Pennywise is a modern personal finance tracker built with Angular and Firebase. Easily manage your expenses, track your balance, and visualize your spending trends with beautiful charts and a responsive UI.

## Features

- 🔒 **Authentication**: Secure login and logout with Firebase Auth
- 💸 **Balance Tracking**: See your current balance at a glance
- 📊 **Expense Chart**: Visualize weekly expenses with a modern chart
- 📝 **Add Expenses**: Quickly add new expenses with a sleek modal form
- 🗂️ **Expense Categories**: Organize spending by category
- 🕒 **Recent Transactions**: View your latest expenses
- 🌈 **Responsive UI**: Built with Tailwind CSS for a clean, mobile-friendly experience

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:khoulyy/pennywise.git
   cd pennywise
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Firebase project:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore and Authentication (Email/Password)
   - Copy your Firebase config to `src/environments/environment.ts`

### Running the App

Start the development server:

```bash
ng serve
```

Visit [http://localhost:4200](http://localhost:4200) in your browser.

## Project Structure

- `src/app/components/` - UI components (balance, expense chart, add expense, etc.)
- `src/app/pages/` - Main pages (home, login)
- `src/app/services/` - Angular services for authentication and Firestore
- `src/app/models/` - TypeScript interfaces for data models

## Firestore Structure

- `users` collection: Each document represents a user, with fields:
  - `uId` (string): Firebase Auth user UID
  - `email` (string)
  - `name` (string)
  - `balance` (number)
- `expenses` collection: Each document represents an expense, with fields:
  - `amount` (number)
  - `category` (string)
  - `date` (string, ISO format)
  - `description` (string)
  - `uId` (string): Firebase Auth user UID

## Customization

- Update categories in the add expense modal as needed
- Tweak Tailwind CSS classes for your preferred look

## Development Scripts

- `ng serve` - Start the dev server
- `ng build` - Build the app for production
- `ng test` - Run unit tests

## License

MIT

---

Made with ❤️ using Angular, Firebase, and Tailwind CSS.
